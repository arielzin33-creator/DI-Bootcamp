/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Upserts answers, typed by question kind.
 * WHY       UNIQUE(project_id, question_id) means revise is an UPDATE, not a duplicate row — the answer history lives in deliverable versions, not here.
 * DEPENDS   db/query.ts, questionBank.service.ts
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Route the value to value_text / value_number / value_json by question type
 *   [ ] Recompute the phase status after each save
 */

// TODO: saveAnswer(projectId, questionId, value)
// TODO: getAnswers(projectId)
