/**
 * Database access for users.
 *
 * Note every query lists its columns explicitly and never does `SELECT *`. That is
 * deliberate: `password_hash` must never leave this module by accident.
 */
import type { User } from "@storyapp/types";
import { query, queryOne } from "../db/pool";

/** A users row including the hash -- for password checking only, never sent to a client. */
interface UserWithHash extends User {
  password_hash: string;
}

const PUBLIC_COLUMNS = "id, username, email, avatar_url";

export async function createUser(
  username: string,
  email: string,
  passwordHash: string,
): Promise<User> {
  const rows = await query<User>(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING ${PUBLIC_COLUMNS}`,
    [username, email, passwordHash],
  );
  // RETURNING on a successful INSERT always yields exactly one row.
  return rows[0] as User;
}

/** Used by login. Returns the hash so the controller can bcrypt.compare against it. */
export async function findUserByEmailWithHash(email: string): Promise<UserWithHash | null> {
  return queryOne<UserWithHash>(
    `SELECT ${PUBLIC_COLUMNS}, password_hash
     FROM users
     WHERE email = $1`,
    [email],
  );
}

export async function findUserById(id: number): Promise<User | null> {
  return queryOne<User>(
    `SELECT ${PUBLIC_COLUMNS}
     FROM users
     WHERE id = $1`,
    [id],
  );
}

export async function emailExists(email: string): Promise<boolean> {
  const row = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM users WHERE email = $1) AS exists`,
    [email],
  );
  return row?.exists ?? false;
}

/**
 * Search users by username or email, for the "add a contributor" picker.
 * `excludeUserId` drops the current user so you cannot add yourself as a collaborator
 * on your own story.
 */
export async function searchUsers(term: string, excludeUserId: number): Promise<User[]> {
  return query<User>(
    `SELECT ${PUBLIC_COLUMNS}
     FROM users
     WHERE id <> $2
       AND (username ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
     ORDER BY username
     LIMIT 10`,
    [term, excludeUserId],
  );
}

/**
 * Updates the caller's own profile. Only the fields present are touched, using the
 * same allow-listed-column pattern as updateStory.
 */
export async function updateUser(
  id: number,
  update: { username?: string; avatar_url?: string | null },
): Promise<User | null> {
  const assignments: string[] = [];
  const values: unknown[] = [];

  if (update.username !== undefined) {
    values.push(update.username);
    assignments.push(`username = $${values.length}`);
  }
  if (update.avatar_url !== undefined) {
    values.push(update.avatar_url);
    assignments.push(`avatar_url = $${values.length}`);
  }
  if (assignments.length === 0) return findUserById(id);

  values.push(id);
  return queryOne<User>(
    `UPDATE users SET ${assignments.join(", ")}
     WHERE id = $${values.length}
     RETURNING ${PUBLIC_COLUMNS}`,
    values,
  );
}
