/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Parses requests and shapes responses for answer routes.
 * WHY       Thin by design: parse -> call service -> return. Keeps HTTP concerns out of services.
 * DEPENDS   services/answer.service.ts
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Wrap async handlers so thrown errors reach the error middleware
 */

// TODO
