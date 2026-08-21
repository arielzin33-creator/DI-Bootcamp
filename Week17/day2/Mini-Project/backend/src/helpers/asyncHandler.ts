import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps an async route handler so a rejected promise reaches Express's error handler.
 *
 * Express 4 does not await handlers. If an `async` handler rejects and nothing catches
 * it, Express never sees the error: the request hangs until it times out, and Node logs
 * an unhandled rejection (which, on modern Node, terminates the process by default).
 * Wrapping every async handler in this is what keeps a failing query from taking the
 * whole server down.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
