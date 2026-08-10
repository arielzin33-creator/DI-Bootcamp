/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Thin typed wrapper over pg. ~30 lines, by design.
 * WHY       Raw pg returns `any` rows, which would defeat the point of TypeScript. This restores typing at the call site without adopting an ORM.
 * DEPENDS   db/pool.ts
 * ADR       ADR-004
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Add a queryOne that throws on 0 rows if a caller needs it
 */

import { pool } from './pool';

/** Runs SQL and returns typed rows. Caller declares the row shape. */
export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool.query(sql, params);
  return res.rows as T[];
}

/** Returns the first row, or null. */
export async function queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** Runs several statements in one transaction. */
export async function transaction<T>(fn: (q: typeof query) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const scoped = async <R>(sql: string, params: unknown[] = []): Promise<R[]> =>
      (await client.query(sql, params)).rows as R[];
    const out = await fn(scoped as typeof query);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
