/**
 * A single shared connection pool for the whole process.
 *
 * The brief asks for "a shared pool of connections for performance" -- opening a new
 * TCP + TLS connection per request is slow, and Render's free Postgres tier caps
 * concurrent connections, so an unpooled app runs out of them quickly.
 */
import { Pool, type QueryResultRow } from "pg";
import { config } from "../config/env";

export const pool = new Pool({
  connectionString: config.databaseUrl,
  // Render's managed Postgres requires TLS. Its certificate is signed by an internal
  // CA that isn't in Node's trust store, hence rejectUnauthorized: false. Locally we
  // connect without TLS at all.
  ssl: config.isProduction ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// A pooled client can be dropped by the server (idle timeout, restart, failover).
// Without a listener on 'error', that emits an unhandled 'error' event and takes the
// whole process down -- exactly the "app should never crash" case the brief warns about.
pool.on("error", (err) => {
  console.error("[db] Unexpected error on idle client:", err.message);
});

/**
 * Runs a parameterised query.
 *
 * Every caller in this codebase passes user input through `params` ($1, $2, ...), never
 * by string-concatenating it into `text`. That is what makes the app immune to SQL
 * injection: the driver sends the SQL and the values separately, so a value can never
 * be parsed as SQL no matter what the user typed.
 */
export async function query<T extends QueryResultRow>(
  text: string,
  params: ReadonlyArray<unknown> = [],
): Promise<T[]> {
  const result = await pool.query<T>(text, params as unknown[]);
  return result.rows;
}

/** Convenience wrapper for queries that return at most one row. */
export async function queryOne<T extends QueryResultRow>(
  text: string,
  params: ReadonlyArray<unknown> = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/**
 * Runs `fn` inside a transaction on a dedicated client, rolling back on any throw.
 * Used where several statements must succeed or fail together.
 */
export async function withTransaction<T>(
  fn: (client: import("pg").PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Always return the client to the pool, success or failure -- otherwise the pool
    // leaks connections and eventually deadlocks waiting for a free one.
    client.release();
  }
}
