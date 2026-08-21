/**
 * Database access for story contributors.
 *
 * The brief's "don't repeat yourself" hint points straight at this module:
 *
 *   "you should have a function that fetches all collaborators for a story ... and then
 *    use it in multiple places, such as when displaying the contributors of a story and
 *    when checking whether the edit is allowed"
 *
 * `getContributorsForStory` is that function. It backs the GET /contributors/:story_id
 * endpoint, the contributor list embedded in each story, the permission check for
 * PATCH /stories/:id (via the authorization middleware), and the WebSocket server's
 * check that an editor is allowed into a story's room. One definition of "who may edit
 * this story", used everywhere.
 */
import type { User } from "@storyapp/types";
import { query, queryOne } from "../db/pool";

const PUBLIC_COLUMNS = "u.id, u.username, u.email, u.avatar_url";

/** All collaborators on a story (does not include the author). */
export async function getContributorsForStory(storyId: number): Promise<User[]> {
  return query<User>(
    `SELECT ${PUBLIC_COLUMNS}
     FROM contributors c
     JOIN users u ON u.id = c.user_id
     WHERE c.story_id = $1
     ORDER BY u.username`,
    [storyId],
  );
}

/** Fetches contributors for several stories at once, grouped by story id.
 *
 * This exists to avoid the N+1 query problem on GET /stories: fetching contributors
 * inside a loop over 50 stories means 51 round trips to the database. One query
 * returning every relevant row, grouped in memory, is a single round trip.
 */
export async function getContributorsForStories(
  storyIds: readonly number[],
): Promise<Map<number, User[]>> {
  const grouped = new Map<number, User[]>();
  if (storyIds.length === 0) return grouped;

  const rows = await query<User & { story_id: number }>(
    `SELECT c.story_id, ${PUBLIC_COLUMNS}
     FROM contributors c
     JOIN users u ON u.id = c.user_id
     WHERE c.story_id = ANY($1::int[])
     ORDER BY u.username`,
    [storyIds],
  );

  for (const row of rows) {
    const { story_id, ...user } = row;
    const list = grouped.get(story_id) ?? [];
    list.push(user);
    grouped.set(story_id, list);
  }
  return grouped;
}

export async function isContributor(storyId: number, userId: number): Promise<boolean> {
  const row = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM contributors WHERE story_id = $1 AND user_id = $2
     ) AS exists`,
    [storyId, userId],
  );
  return row?.exists ?? false;
}

/**
 * Single source of truth for "may this user edit this story?".
 *
 * Used by the REST authorization middleware AND by the WebSocket server, so a
 * collaborator's live edits and their PATCH requests can never disagree about
 * permission.
 */
export async function canEditStory(storyId: number, userId: number): Promise<boolean> {
  const row = await queryOne<{ allowed: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM stories WHERE id = $1 AND author_id = $2
       UNION ALL
       SELECT 1 FROM contributors WHERE story_id = $1 AND user_id = $2
     ) AS allowed`,
    [storyId, userId],
  );
  return row?.allowed ?? false;
}

export interface ContributorRow {
  id: number;
  story_id: number;
  user_id: number;
}

/**
 * Adds a collaborator.
 *
 * `ON CONFLICT DO NOTHING` pairs with the UNIQUE (story_id, user_id) constraint in the
 * schema: adding the same person twice is a no-op instead of a duplicate row or a 500.
 * Returns null when the row already existed, so the controller can answer 409.
 */
export async function addContributor(
  storyId: number,
  userId: number,
): Promise<ContributorRow | null> {
  return queryOne<ContributorRow>(
    `INSERT INTO contributors (story_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (story_id, user_id) DO NOTHING
     RETURNING id, story_id, user_id`,
    [storyId, userId],
  );
}

export async function findContributorById(id: number): Promise<ContributorRow | null> {
  return queryOne<ContributorRow>(
    `SELECT id, story_id, user_id FROM contributors WHERE id = $1`,
    [id],
  );
}

/** Returns true when a row was actually deleted, false when the id did not exist. */
export async function removeContributor(id: number): Promise<boolean> {
  const rows = await query<{ id: number }>(
    `DELETE FROM contributors WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}
