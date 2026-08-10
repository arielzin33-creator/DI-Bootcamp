/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   The single pg connection pool.
 * WHY       One pool per process. Creating pools per request exhausts Postgres connections.
 * DEPENDS   pg, config/env.ts
 * ADR       ADR-004
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Set max connections (10 is ample locally)
 */

import { Pool } from 'pg';
import { env } from '../config/env';

export const pool = new Pool({ connectionString: env.DATABASE_URL, max: 10 });
