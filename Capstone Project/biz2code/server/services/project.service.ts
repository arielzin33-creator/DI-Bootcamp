/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Create / list projects; loads the seed project.
 * WHY       The demo needs a 'New project' button that resets cleanly, and a pre-filled seed so the walkthrough does not depend on typing 20 answers live.
 * DEPENDS   db/query.ts, ../data/seed-project.json (project root)
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] create() also inserts 4 phases rows (phase 1 in_progress, rest pending)
 *   [ ] createFromSeed() pre-fills all answers EXCEPT the 5 demo questions
 */

// TODO: create(userId, name)
// TODO: createFromSeed(userId) — pre-fills 15 of 20 answers
// TODO: list(userId) / get(projectId, userId)
