/**
 * Registration, login, token refresh and logout.
 */
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import type { AuthResponse, User } from "@storyapp/types";
import { ApiError } from "../helpers/ApiError";
import {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../helpers/tokens";
import { validateLogin, validateRegistration } from "../helpers/validation";
import { createUser, emailExists, findUserByEmailWithHash, findUserById } from "../models/userModel";

const SALT_ROUNDS = 10;

/** Issues both tokens: refresh in an httpOnly cookie, access in the JSON body. */
function issueSession(res: Response, user: User): AuthResponse {
  res.cookie(REFRESH_COOKIE_NAME, signRefreshToken(user.id), refreshCookieOptions());
  return { accessToken: signAccessToken(user.id), user };
}

/** POST /api/auth/register */
export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password } = validateRegistration(req.body);

  if (await emailExists(email)) {
    // 409 rather than 400: the input was well-formed, it just collides with an
    // existing account. The email column is also UNIQUE, so this check is a nicety
    // for the error message -- the database is what actually guarantees uniqueness
    // even if two registrations race each other.
    throw ApiError.conflict("An account with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser(username, email, passwordHash);

  // The brief asks that signing up logs the user straight in, so this returns a full
  // session exactly like /login rather than just a success message.
  res.status(201).json(issueSession(res, user));
}

/** POST /api/auth/login */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = validateLogin(req.body);

  const existing = await findUserByEmailWithHash(email);

  // Deliberately identical response whether the email is unknown or the password is
  // wrong. Saying "no account with that email" would let anyone enumerate which
  // addresses are registered.
  if (!existing) {
    throw ApiError.unauthorized("Invalid credentials.");
  }

  const isMatch = await bcrypt.compare(password, existing.password_hash);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid credentials.");
  }

  const user: User = {
    id: existing.id,
    username: existing.username,
    email: existing.email,
    avatar_url: existing.avatar_url,
  };
  res.json(issueSession(res, user));
}

/**
 * POST /api/auth/refresh
 *
 * Called by the frontend on page load (the access token lives only in memory, so a
 * reload loses it) and automatically whenever a request comes back 401.
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!token) {
    throw ApiError.unauthorized("Your session has expired. Please log in again.");
  }

  const payload = verifyRefreshToken(token); // throws 401 when expired/tampered

  // Re-read the user rather than trusting the token's claims alone: if the account was
  // deleted since the refresh token was issued, the session must not continue.
  const user = await findUserById(payload.userId);
  if (!user) {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
    throw ApiError.unauthorized("Your session has expired. Please log in again.");
  }

  // Rotate the refresh token as well, so a long-lived session doesn't hinge on one
  // cookie that stays valid for a full 7 days after it may have leaked.
  res.json(issueSession(res, user));
}

/** POST /api/auth/logout */
export async function logout(_req: Request, res: Response): Promise<void> {
  // clearCookie must receive the same options the cookie was set with, or the browser
  // will not match and delete it.
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
  res.status(204).send();
}

/** GET /api/auth/me -- who am I, used to rehydrate the UI after a refresh. */
export async function me(req: Request, res: Response): Promise<void> {
  const user = await findUserById(req.user!.id);
  if (!user) throw ApiError.unauthorized();
  res.json(user);
}
