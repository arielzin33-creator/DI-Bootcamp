/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Parses requests and shapes responses for project routes.
 * WHY       Thin by design: parse -> call service -> return. Keeps HTTP concerns out of services.
 * DEPENDS   services/project.service.ts
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Wrap async handlers so thrown errors reach the error middleware
 */

// TODO
