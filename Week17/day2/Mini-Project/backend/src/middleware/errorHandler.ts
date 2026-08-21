import type { NextFunction, Request, Response } from "express";
import type { ApiErrorResponse } from "@storyapp/types";
import { ApiError } from "../helpers/ApiError";
import { config } from "../config/env";

/** 404 handler for any route that did not match. Must be mounted after all routes. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ message: `Cannot ${req.method} ${req.path}` } satisfies ApiErrorResponse);
}

/**
 * The single place every error ends up.
 *
 * This is what delivers the brief's "the app should never crash ... and should return a
 * helpful message if an exception happens without revealing any technical details":
 *
 *   - ApiError  -> intentional, user-facing. Send its status and message.
 *   - anything else -> unexpected. Log the real error server-side for debugging, and
 *     send a deliberately vague 500 to the client. A raw `pg` error would otherwise
 *     leak table names, column names and constraint names straight to an attacker.
 *
 * Express identifies an error handler by its arity, so the unused `_next` parameter
 * must stay -- with three parameters this silently becomes a normal middleware and
 * every error turns into a hung request.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ApiError) {
    const body: ApiErrorResponse = { message: error.message };
    if (error.errors) body.errors = error.errors;
    res.status(error.status).json(body);
    return;
  }

  // Malformed JSON body: express.json() throws a SyntaxError with a `body` property.
  // That is caused by bad client input, so it is a 400 rather than a 500.
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ message: "Request body is not valid JSON." } satisfies ApiErrorResponse);
    return;
  }

  console.error("[error]", error);

  res.status(500).json({
    message: "Something went wrong on our end. Please try again.",
    // Only in development do we attach the real message, to keep debugging bearable.
    ...(config.isProduction
      ? {}
      : { errors: { debug: error instanceof Error ? error.message : String(error) } }),
  } satisfies ApiErrorResponse);
}
