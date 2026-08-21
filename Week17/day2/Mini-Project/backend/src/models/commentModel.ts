/**
 * Database access for story comments and their reactions.
 *
 * Column names follow the advanced brief: `comment_text` and `timestamp`.
 */
import type { Comment, Reaction, User } from "@storyapp/types";
import { query, queryOne } from "../db/pool";

interface CommentRow {
  id: number;
  story_id: number;
  user_id: number;
  comment_text: string;
  timestamp: string;
  edited_at: string | null;
  author_username: string | null;
  author_email: string | null;
  author_avatar: string | null;
}

const SELECT_COMMENT = `
  SELECT c.id, c.story_id, c.user_id, c.comment_text, c.timestamp, c.edited_at,
         u.username AS author_username, u.email AS author_email, u.avatar_url AS author_avatar
  FROM comments c
  LEFT JOIN users u ON u.id = c.user_id
`;

function toComment(row: CommentRow, reactions: Reaction[]): Comment {
  const author: User | null =
    row.author_username === null || row.author_email === null
      ? null
      : {
          id: row.user_id,
          username: row.author_username,
          email: row.author_email,
          avatar_url: row.author_avatar,
        };

  return {
    id: row.id,
    story_id: row.story_id,
    user_id: row.user_id,
    comment_text: row.comment_text,
    author,
    reactions,
    timestamp: row.timestamp,
    edited_at: row.edited_at,
  };
}

/**
 * Reaction tallies for a set of comments, grouped by comment id.
 *
 * Aggregated in SQL (one query for the whole page) rather than by loading every
 * reaction row and counting in JavaScript. `viewerId` is what fills in each tally's
 * `reacted` flag, so the UI can highlight the emoji you personally clicked.
 */
export async function getReactionsForComments(
  commentIds: readonly number[],
  viewerId: number,
): Promise<Map<number, Reaction[]>> {
  const grouped = new Map<number, Reaction[]>();
  if (commentIds.length === 0) return grouped;

  const rows = await query<{
    comment_id: number;
    emoji: string;
    count: string;
    reacted: boolean;
  }>(
    `SELECT comment_id,
            emoji,
            COUNT(*)                                   AS count,
            BOOL_OR(user_id = $2)                      AS reacted
     FROM comment_reactions
     WHERE comment_id = ANY($1::int[])
     GROUP BY comment_id, emoji
     ORDER BY emoji`,
    [commentIds, viewerId],
  );

  for (const row of rows) {
    const list = grouped.get(row.comment_id) ?? [];
    // COUNT() comes back as a string from node-postgres (bigint), so parse it --
    // otherwise the frontend would try to render "3" and compare it as a number.
    list.push({ emoji: row.emoji, count: Number(row.count), reacted: row.reacted });
    grouped.set(row.comment_id, list);
  }
  return grouped;
}

export async function getCommentsForStory(storyId: number, viewerId: number): Promise<Comment[]> {
  const rows = await query<CommentRow>(
    `${SELECT_COMMENT} WHERE c.story_id = $1 ORDER BY c.timestamp ASC`,
    [storyId],
  );
  const reactions = await getReactionsForComments(
    rows.map((row) => row.id),
    viewerId,
  );
  return rows.map((row) => toComment(row, reactions.get(row.id) ?? []));
}

export async function getCommentById(id: number, viewerId: number): Promise<Comment | null> {
  const row = await queryOne<CommentRow>(`${SELECT_COMMENT} WHERE c.id = $1`, [id]);
  if (!row) return null;
  const reactions = await getReactionsForComments([id], viewerId);
  return toComment(row, reactions.get(id) ?? []);
}

export async function createComment(
  storyId: number,
  userId: number,
  commentText: string,
): Promise<Comment> {
  const inserted = await queryOne<{ id: number }>(
    `INSERT INTO comments (story_id, user_id, comment_text)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [storyId, userId, commentText],
  );
  return (await getCommentById(inserted!.id, userId)) as Comment;
}

/**
 * Updates a comment's text and stamps `edited_at`.
 * Returns null when the id does not exist; the caller checks ownership first.
 */
export async function updateComment(
  id: number,
  commentText: string,
  viewerId: number,
): Promise<Comment | null> {
  const rows = await query<{ id: number }>(
    `UPDATE comments
     SET comment_text = $1, edited_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id`,
    [commentText, id],
  );
  if (rows.length === 0) return null;
  return getCommentById(id, viewerId);
}

/** The raw row, used by the controllers for ownership checks before mutating. */
export async function findCommentOwnership(
  id: number,
): Promise<{ id: number; story_id: number; user_id: number; story_author_id: number } | null> {
  return queryOne(
    `SELECT c.id, c.story_id, c.user_id, s.author_id AS story_author_id
     FROM comments c
     JOIN stories s ON s.id = c.story_id
     WHERE c.id = $1`,
    [id],
  );
}

export async function deleteComment(id: number): Promise<boolean> {
  const rows = await query<{ id: number }>(`DELETE FROM comments WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

export async function countCommentsByUser(userId: number): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `SELECT COUNT(*) AS count FROM comments WHERE user_id = $1`,
    [userId],
  );
  return Number(row?.count ?? 0);
}

/* ------------------------------------------------------------------ *
 * Reactions
 * ------------------------------------------------------------------ */

/**
 * Adds the reaction, or removes it if this user already reacted with that emoji.
 *
 * `ON CONFLICT DO NOTHING` + checking whether a row came back makes this a safe
 * toggle: two rapid clicks cannot create two rows, and the second click removes.
 * Returns the fresh tallies so the client can reconcile its optimistic update.
 */
export async function toggleReaction(
  commentId: number,
  userId: number,
  emoji: string,
): Promise<Reaction[]> {
  const inserted = await queryOne<{ id: number }>(
    `INSERT INTO comment_reactions (comment_id, user_id, emoji)
     VALUES ($1, $2, $3)
     ON CONFLICT (comment_id, user_id, emoji) DO NOTHING
     RETURNING id`,
    [commentId, userId, emoji],
  );

  if (!inserted) {
    // The row already existed -> this click is an un-react.
    await query(
      `DELETE FROM comment_reactions
       WHERE comment_id = $1 AND user_id = $2 AND emoji = $3`,
      [commentId, userId, emoji],
    );
  }

  const grouped = await getReactionsForComments([commentId], userId);
  return grouped.get(commentId) ?? [];
}
