/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Verifies the JWT from the httpOnly cookie and attaches req.userId.
 * WHY       Cookie, not Authorization header — not readable by page scripts, so XSS cannot steal it.
 * DEPENDS   jsonwebtoken, config/env.ts
 * ADR       ADR-005
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Attach userId to the request via module augmentation, not `any`
 *   [ ] Return 401 (not 500) on a malformed or expired token
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid session' });
  }
}
