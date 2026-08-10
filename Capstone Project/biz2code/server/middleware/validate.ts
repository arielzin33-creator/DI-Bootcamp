/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Validates request bodies against the question bank / simple shape checks.
 * WHY       Answers must match their declared question type. A number question receiving a string would corrupt the calculation layer downstream.
 * DEPENDS   services/questionBank.service.ts
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Validate value against question.type
 *   [ ] Enforce numeric min/max from the bank
 */

import type { Request, Response, NextFunction } from 'express';

export function validateBody(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = fields.filter((f) => req.body?.[f] === undefined);
    if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
    next();
  };
}
