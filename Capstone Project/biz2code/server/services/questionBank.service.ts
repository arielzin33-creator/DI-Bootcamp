/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Loads and indexes question-bank.json.
 * WHY       Questions are authored content in the repo, not DB rows — diffable, reviewable, and openable on stage to prove the gate is fixed.
 * DEPENDS   ../data/question-bank.json (project root)
 * ADR       ADR-006
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Validate the bank at boot; crash on a malformed file
 *   [ ] getQuestionsForPhase(n)
 *   [ ] getQuestion(id)
 */

export interface Question {
  questionId: string; phaseId: string; order: number; text: string;
  type: 'text' | 'select' | 'multiselect' | 'number';
  required: boolean; inDemoSet: boolean; helpText: string | null;
  feeds: string[]; options?: string[];
  numeric?: { unit: string; min: number; max: number };
}

// TODO: getQuestionsForPhase(phaseNo: number): Question[]
// TODO: getQuestion(id: string): Question
