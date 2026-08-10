/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   ★ THE GATE. The only module allowed to mutate phases.status or projects.current_phase.
 * WHY       This is the product. Every other module is UI or plumbing around this state machine. Centralising mutation here is what makes the invariant enforceable and testable.
 * DEPENDS   db/query.ts, questionBank.service.ts
 * ADR       ADR-003
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Implement canApprove: every REQUIRED question in the phase has an answer
 *   [ ] approve(): set approved + approved_at, then advance current_phase if < 4
 *   [ ] revise(): set status back to 'revising'; do NOT touch current_phase
 *   [ ] Reject any attempt to approve a phase that is not the project's current phase
 */

import { query, queryOne, transaction } from '../db/query';
import { getQuestionsForPhase } from './questionBank.service';
import { AppError } from '../middleware/error';

export type PhaseStatus =
  | 'pending' | 'in_progress' | 'awaiting_approval' | 'approved' | 'revising';

/** Every required question in the phase must have an answer. */
export async function canApprove(projectId: number, phaseNo: number): Promise<boolean> {
  const required = getQuestionsForPhase(phaseNo).filter((q) => q.required);
  const answered = await query<{ question_id: string }>(
    'SELECT question_id FROM answers WHERE project_id = $1 AND phase_no = $2',
    [projectId, phaseNo],
  );
  const have = new Set(answered.map((a) => a.question_id));
  return required.every((q) => have.has(q.questionId));
}

/** THE INVARIANT: approve only the current phase, only when complete. */
export async function approvePhase(projectId: number, phaseNo: number) {
  const project = await queryOne<{ current_phase: number }>(
    'SELECT current_phase FROM projects WHERE id = $1', [projectId],
  );
  if (!project) throw new AppError('Project not found', 404);
  if (project.current_phase !== phaseNo)
    throw new AppError(`Phase ${phaseNo} is not the current phase`, 409);
  if (!(await canApprove(projectId, phaseNo)))
    throw new AppError('Phase has unanswered required questions', 409);

  return transaction(async (q) => {
    await q(
      `UPDATE phases SET status = 'approved', approved_at = now()
       WHERE project_id = $1 AND phase_no = $2`, [projectId, phaseNo],
    );
    if (phaseNo < 4) {
      await q('UPDATE projects SET current_phase = $2, updated_at = now() WHERE id = $1',
        [projectId, phaseNo + 1]);
      await q(`UPDATE phases SET status = 'in_progress'
               WHERE project_id = $1 AND phase_no = $2`, [projectId, phaseNo + 1]);
    }
    return { approved: phaseNo, nextPhase: phaseNo < 4 ? phaseNo + 1 : null };
  });
}

/** Revise returns to the SAME phase. It never rewinds current_phase. */
export async function revisePhase(projectId: number, phaseNo: number) {
  await query(`UPDATE phases SET status = 'revising', approved_at = NULL
               WHERE project_id = $1 AND phase_no = $2`, [projectId, phaseNo]);
}
