/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Single error handler. Last in the middleware chain.
 * WHY       Without this, a thrown error in an async handler becomes an unhandled rejection and the request hangs — which reads as a frozen UI.
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Log the stack server-side; never return it to the client
 *   [ ] Map known AppError codes to status codes
 */

import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof AppError ? err.status : 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Internal error' : err.message });
}
