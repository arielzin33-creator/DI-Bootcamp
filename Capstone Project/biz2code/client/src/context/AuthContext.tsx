/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Holds the current user; exposes login/logout.
 * WHY       Context rather than Redux — auth is the only genuine client state, so a store would be ceremony without benefit.
 * DEPENDS   lib/api.ts
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Call GET /me on mount to restore a session
 */

// TODO
