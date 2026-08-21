import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../helpers/ApiError";
import { extractBearerToken, verifyAccessToken } from "../helpers/tokens";

/**
 * Requires a valid access token, and attaches the caller as `req.user`.
 *
 * Two deliberate differences from the brief's example middleware:
 *
 *  1. The token is parsed out of "Bearer <token>" rather than passing the raw header
 *     into jwt.verify() (see extractBearerToken in helpers/tokens.ts for why that
 *     example always fails).
 *
 *  2. A missing or invalid token is 401, not 403. The brief's own endpoint spec asks
 *     for "401 for an attempt to use a protected resource while logged out", and the
 *     distinction is what the frontend keys off: 401 triggers the refresh-and-replay
 *     flow, whereas 403 means "you are logged in but this isn't yours" and must NOT
 *     trigger a token refresh.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    next(ApiError.unauthorized("You must be logged in to do that."));
    return;
  }

  try {
    const payload = verifyAccessToken(token); // throws ApiError(401) if invalid/expired
    req.user = { id: payload.userId };
    next();
  } catch (error) {
    next(error);
  }
}
