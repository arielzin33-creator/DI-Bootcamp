/**
 * Database access for stories.
 *
 * Every story handed back to a controller is already joined with its author and its
 * contributors, so the API's `Story` shape always matches the shared `Story` type in
 * types/index.d.ts -- the frontend never has to guess whether `contributors` is there.
 */
import crypto from "node:crypto";
import type { SharedStory, Story, User } from "@storyapp/types";
import { query, queryOne, withTransaction } from "../db/pool";
import { getContributorsForStories, getContributorsForStory } from "./contributorModel";
import { createVersion } from "./versionModel";

/** The raw stories row plus the author columns pulled in by the JOIN. */
interface StoryRow {
  id: number;
  title: string;
  content: string;
  author_id: number;
  comments_enabled: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
  author_username: string | null;
  author_email: string | null;
  author_avatar: string | null;
}

const SELECT_STORY = `
  SELECT s.id, s.title, s.content, s.author_id, s.comments_enabled, s.share_token,
         s.created_at, s.updated_at,
         u.username AS author_username, u.email AS author_email, u.avatar_url AS author_avatar
  FROM stories s
  LEFT JOIN users u ON u.id = s.author_id
`;

function toAuthor(row: StoryRow): User | null {
  if (row.author_username === null || row.author_email === null) return null;
  return {
    id: row.author_id,
    username: row.author_username,
    email: row.author_email,
    avatar_url: row.author_avatar,
  };
}

function toStory(row: StoryRow, contributors: User[]): Story {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    author_id: row.author_id,
    author: toAuthor(row),
    contributors,
    comments_enabled: row.comments_enabled,
    share_token: row.share_token,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Lists stories, newest first.
 *
 * `authorId` powers the homepage's "only my stories" filter. Filtering in SQL rather
 * than in React means we are not shipping every story in the database to the browser
 * just to hide most of them.
 */
export async function listStories(authorId?: number): Promise<Story[]> {
  const rows = authorId
    ? await query<StoryRow>(`${SELECT_STORY} WHERE s.author_id = $1 ORDER BY s.updated_at DESC`, [
        authorId,
      ])
    : await query<StoryRow>(`${SELECT_STORY} ORDER BY s.updated_at DESC`);

  // One extra query for all contributors, instead of one per story (see
  // getContributorsForStories for why).
  const contributorsByStory = await getContributorsForStories(rows.map((row) => row.id));

  return rows.map((row) => toStory(row, contributorsByStory.get(row.id) ?? []));
}

/** Stories a user collaborates on but did not write -- for their profile page. */
export async function listContributedStories(userId: number): Promise<Story[]> {
  const rows = await query<StoryRow>(
    `${SELECT_STORY}
     JOIN contributors c ON c.story_id = s.id
     WHERE c.user_id = $1 AND s.author_id <> $1
     ORDER BY s.updated_at DESC`,
    [userId],
  );
  const contributorsByStory = await getContributorsForStories(rows.map((row) => row.id));
  return rows.map((row) => toStory(row, contributorsByStory.get(row.id) ?? []));
}

export async function getStoryById(id: number): Promise<Story | null> {
  const row = await queryOne<StoryRow>(`${SELECT_STORY} WHERE s.id = $1`, [id]);
  if (!row) return null;
  const contributors = await getContributorsForStory(id);
  return toStory(row, contributors);
}

export async function createStory(
  title: string,
  content: string,
  authorId: number,
): Promise<Story> {
  const inserted = await queryOne<{ id: number }>(
    `INSERT INTO stories (title, content, author_id)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [title, content, authorId],
  );
  // The initial state is version 1, so the history never starts empty and the first
  // edit has something to diff against.
  await createVersion(inserted!.id, title, content, authorId);
  return (await getStoryById(inserted!.id)) as Story;
}

/**
 * Applies a partial update, snapshotting the PREVIOUS state as a version first.
 *
 * The snapshot and the update run in one transaction: if the UPDATE fails, the
 * version row is rolled back too, so history can never contain a save that did not
 * actually happen.
 *
 * The SET clause is assembled from a fixed allow-list of column names -- `title`,
 * `content` and `comments_enabled` are string literals in this file, never values
 * taken from the request. The user-supplied *values* still travel as $1/$2
 * parameters, so this dynamic SQL remains injection-proof.
 *
 * `updated_at` is not set here; the stories_set_updated_at trigger in schema.sql
 * maintains it (the Postgres replacement for MySQL's ON UPDATE CURRENT_TIMESTAMP).
 */
export async function updateStory(
  id: number,
  update: { title?: string; content?: string; comments_enabled?: boolean },
  userId: number,
): Promise<Story | null> {
  const changesText = update.title !== undefined || update.content !== undefined;

  const updated = await withTransaction(async (client) => {
    if (changesText) {
      // Snapshot the state as it is *before* this save.
      const current = await client.query<{ title: string; content: string }>(
        `SELECT title, content FROM stories WHERE id = $1 FOR UPDATE`,
        [id],
      );
      const before = current.rows[0];
      if (!before) return false;
      await createVersion(id, before.title, before.content, userId, client);
    }

    const assignments: string[] = [];
    const values: unknown[] = [];

    if (update.title !== undefined) {
      values.push(update.title);
      assignments.push(`title = $${values.length}`);
    }
    if (update.content !== undefined) {
      values.push(update.content);
      assignments.push(`content = $${values.length}`);
    }
    if (update.comments_enabled !== undefined) {
      values.push(update.comments_enabled);
      assignments.push(`comments_enabled = $${values.length}`);
    }
    if (assignments.length === 0) return true;

    values.push(id);
    const result = await client.query(
      `UPDATE stories SET ${assignments.join(", ")} WHERE id = $${values.length} RETURNING id`,
      values,
    );
    return result.rowCount !== null && result.rowCount > 0;
  });

  if (!updated) return null;
  return getStoryById(id);
}

/** Returns true when a row was actually deleted, false when the id did not exist. */
export async function deleteStory(id: number): Promise<boolean> {
  const rows = await query<{ id: number }>(`DELETE FROM stories WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

/* ------------------------------------------------------------------ *
 * Sharing
 * ------------------------------------------------------------------ */

/**
 * Returns the story's share token, creating one on first use.
 *
 * The token is 32 bytes from `crypto.randomBytes` -- not the story id, and not
 * anything guessable. A share link is a capability: whoever holds it can read the
 * story, so it must not be enumerable by counting upwards from 1.
 */
export async function ensureShareToken(storyId: number): Promise<string | null> {
  const existing = await queryOne<{ share_token: string | null }>(
    `SELECT share_token FROM stories WHERE id = $1`,
    [storyId],
  );
  if (!existing) return null;
  if (existing.share_token) return existing.share_token;

  const token = crypto.randomBytes(24).toString("base64url");
  const updated = await queryOne<{ share_token: string }>(
    `UPDATE stories SET share_token = $1 WHERE id = $2 RETURNING share_token`,
    [token, storyId],
  );
  return updated?.share_token ?? null;
}

/** Revokes a share link. */
export async function clearShareToken(storyId: number): Promise<void> {
  await query(`UPDATE stories SET share_token = NULL WHERE id = $1`, [storyId]);
}

/**
 * Public read of a shared story.
 *
 * Returns a deliberately reduced shape: title, body, author's display name and the
 * timestamp. No ids, no email addresses, no contributor list -- this endpoint needs
 * no authentication, so it must expose nothing that isn't meant to be public.
 */
export async function getSharedStory(token: string): Promise<SharedStory | null> {
  return queryOne<SharedStory>(
    `SELECT s.title, s.content, s.updated_at,
            COALESCE(u.username, 'Unknown') AS author_name
     FROM stories s
     LEFT JOIN users u ON u.id = s.author_id
     WHERE s.share_token = $1`,
    [token],
  );
}
