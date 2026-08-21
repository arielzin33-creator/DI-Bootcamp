/**
 * Signing, verifying and transporting JWTs.
 *
 * Token strategy (as required by the brief):
 *   - access token  -> short-lived (15m), returned in the JSON body, held in memory by
 *                      the frontend's Redux store. Never in localStorage: anything in
 *                      localStorage is readable by any XSS payload that lands on the page.
 *   - refresh token -> long-lived (7d), sent as an httpOnly cookie so JavaScript cannot
 *                      read it at all, and used only to mint new access tokens.
 */
import jwt, { type SignOptions } from "jsonwebtoken";
import type { CookieOptions } from "express";
import type { JwtPayload } from "@storyapp/types";
import { config } from "../config/env";
import { ApiError } from "./ApiError";

export const REFRESH_COOKIE_NAME = "refreshToken";

export function signAccessToken(userId: number): string {
  return jwt.sign({ userId } satisfies JwtPayload, config.jwtSecret, {
    expiresIn: config.accessTokenTtl,
  } as SignOptions);
}

export function signRefreshToken(userId: number): string {
  return jwt.sign({ userId } satisfies JwtPayload, config.refreshSecret, {
    expiresIn: config.refreshTokenTtl,
  } as SignOptions);
}

/** Verifies an access token, converting any jsonwebtoken error into a clean 401. */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch {
    // Deliberately not distinguishing "expired" from "malformed" from "bad signature"
    // in the message -- that detail helps an attacker probe, and the frontend's refresh
    // flow reacts to the 401 status alone.
    throw ApiError.unauthorized("Your session has expired. Please log in again.");
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.refreshSecret) as JwtPayload;
  } catch {
    throw ApiError.unauthorized("Your session has expired. Please log in again.");
  }
}

/**
 * Cookie options for the refresh token.
 *
 * `sameSite`/`secure` are the part that most commonly breaks a deployed build. In
 * production the frontend (static site) and the API are on two different Render
 * domains, which makes every API call cross-site; a cookie must be
 * `SameSite=None; Secure` for the browser to send it at all. The brief's own snippet
 * sets only `{ httpOnly: true, secure: true }`, which defaults to SameSite=Lax and so
 * silently never arrives at /auth/refresh once deployed.
 *
 * Locally, http://localhost cannot set a Secure cookie, so we use `SameSite=Lax`
 * without `Secure` in development.
 */
export function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matching REFRESH_TOKEN_TTL
  };
}

/**
 * Extracts a bearer token from the Authorization header.
 *
 * The brief's own middleware snippet does:
 *     const token = req.headers["authorization"]
 *     jwt.verify(token, ...)
 * That passes the whole header value -- "Bearer eyJhbGci..." -- into verify(), which
 * then always fails with JsonWebTokenError: jwt malformed, because the literal
 * "Bearer " prefix is not part of the token. The scheme has to be stripped first.
 */
export function extractBearerToken(headerValue: string | undefined): string | null {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(" ");
  if (!token || scheme?.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}
