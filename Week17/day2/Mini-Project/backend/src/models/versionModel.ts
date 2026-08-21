/**
 * Version history for stories.
 *
 * A new row is written every time a story is saved (see storyModel.updateStory),
 * so the history is a straightforward append-only log.
 */
import type { Version, VersionSummary } from "@storyapp/types";
import type { PoolClient } from "pg";
import { query, queryOne } from "../db/pool";

interface VersionRow extends Omit<Version, "created_by_name"> {
  created_by_name: string | null;
}

const SELECT_VERSION = `
  SELECT v.id, v.story_id, v.title, v.content, v.timestamp, v.created_by,
         u.username AS created_by_name
  FROM versions v
  LEFT JOIN users u ON u.id = v.created_by
`;

/**
 * Writes a snapshot.
 *
 * Accepts an optional transaction client so the snapshot and the story update can be
 * committed together -- a history entry for a save that then failed would be a lie.
 */
export async function createVersion(
  storyId: number,
  title: string,
  content: string,
  userId: number,
  client?: PoolClient,
): Promise<void> {
  const sql = `INSERT INTO versions (story_id, title, content, created_by)
               VALUES ($1, $2, $3, $4)`;
  const params = [storyId, title, content, userId];

  if (client) {
    await client.query(sql, params);
    return;
  }
  await query(sql, params);
}

/** History list, newest first. Bodies are omitted -- they can be very large. */
export async function listVersions(storyId: number): Promise<VersionSummary[]> {
  return query<VersionSummary>(
    `SELECT v.id, v.story_id, v.title, v.timestamp, v.created_by,
            u.username AS created_by_name
     FROM versions v
     LEFT JOIN users u ON u.id = v.created_by
     WHERE v.story_id = $1
     ORDER BY v.timestamp DESC, v.id DESC`,
    [storyId],
  );
}

export async function getVersionById(id: number): Promise<Version | null> {
  return queryOne<VersionRow>(`${SELECT_VERSION} WHERE v.id = $1`, [id]);
}

/** The version immediately preceding `id` for the same story -- the diff baseline. */
export async function getPreviousVersion(
  storyId: number,
  id: number,
  timestamp: string,
): Promise<Version | null> {
  return queryOne<VersionRow>(
    `${SELECT_VERSION}
     WHERE v.story_id = $1
       AND (v.timestamp, v.id) < ($2::timestamptz, $3)
     ORDER BY v.timestamp DESC, v.id DESC
     LIMIT 1`,
    [storyId, timestamp, id],
  );
}
