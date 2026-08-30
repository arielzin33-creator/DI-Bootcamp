// src/middleware/errorHandler.ts
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

/** Errors thrown deliberately for a bad request (validation, bad filename, etc.) should be 400s, not 500s. */
export class BadRequestError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Invalid request body.',
      details: err.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    });
    return;
  }

  if (err instanceof BadRequestError) {
    res.status(400).json({ error: err.message });
    return;
  }

  const message = err instanceof Error ? err.message : String(err);
  console.error('[error]', message);

  // Upstream/service failures (Tavily, Ollama, a fetched page timing out)
  // are the caller's dependency failing, not this server's own bug --
  // 502 reflects that distinction rather than lumping every failure into
  // a generic 500.
  const isUpstreamFailure = /Tavily|Ollama|timed out|Fetching .* failed/.test(message);
  res.status(isUpstreamFailure ? 502 : 500).json({ error: message });
}
