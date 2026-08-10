/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Adds `userId` to Express's Request type.
 * WHY       requireAuth attaches req.userId. Without this augmentation every
 *           controller would need `(req as any).userId`, which discards the
 *           type safety TypeScript was adopted for.
 * DEPENDS   middleware/auth.ts
 * ADR       ADR-005
 * ─────────────────────────────────────────────────────────────
 */

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export {};
