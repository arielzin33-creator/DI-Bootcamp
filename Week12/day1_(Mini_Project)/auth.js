import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByUsername, findUserById, createUser } from '../data/users.js';
import { revokeToken, isTokenRevoked } from '../data/revokedTokens.js';
import { validateRegistration } from '../utils/validation.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js';
import { config } from '../config.js';
import { createLoginRateLimiter, createRefreshRateLimiter } from '../middleware/rateLimiters.js';

const SALT_ROUNDS = 12;

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'lax',
  path: '/',
};

// The refresh token cookie is scoped to only the paths that actually need
// it. There's no reason for the browser to attach it to, say, a request
// for `/profile` — narrowing `path` reduces how often the browser sends
// the more sensitive, longer-lived token over the wire at all.
const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'lax',
  path: '/api/auth',
};

function issueSession(res, user) {
  const accessToken = generateAccessToken(user);
  const { token: refreshToken } = generateRefreshToken(user);

  res.cookie('accessToken', accessToken, {
    ...accessTokenCookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...refreshTokenCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

/**
 * A factory, not a module-level router — see the comment in
 * `rateLimiters.js` for why: each call builds its own rate-limiter
 * instances, so every `createApp()` gets fully independent rate-limit
 * state instead of sharing counters with every other app built in the same
 * process (which is exactly what would otherwise happen across test files).
 */
export function createAuthRouter() {
  const router = Router();
  const loginRateLimiter = createLoginRateLimiter();
  const refreshRateLimiter = createRefreshRateLimiter();

  router.post('/register', async (req, res) => {
    const { username, password } = req.body ?? {};

    const errors = validateRegistration({ username, password });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const existing = await findUserByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'That username is already taken.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser({ username, passwordHash });

    issueSession(res, user);
    res.status(201).json({ id: user.id, username: user.username });
  });

  router.post('/login', loginRateLimiter, async (req, res) => {
    const { username, password } = req.body ?? {};

    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await findUserByUsername(username);

    // Comparing against a fixed dummy hash when the user doesn't exist
    // keeps the response time (and the response itself) indistinguishable
    // from a wrong-password case for a real user. Without this, an
    // attacker could use response timing (or just a different error) to
    // enumerate which usernames exist at all.
    const passwordHash = user?.passwordHash ?? '$2b$12$invalidsaltinvalidsaltinvalidsaOK';
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    issueSession(res, user);
    res.status(200).json({ id: user.id, username: user.username });
  });

  router.post('/logout', (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // `jwt.decode` (not `verify`) deliberately skips signature/expiry
      // checking here — even an already-expired or otherwise-invalid
      // refresh token should still have its `jti` marked revoked if we can
      // read one, defensively, rather than only bothering for tokens that
      // were still valid at the moment of logout.
      const decoded = jwt.decode(refreshToken);
      if (decoded?.jti) {
        revokeToken(decoded.jti);
      }
    }

    res.clearCookie('accessToken', accessTokenCookieOptions);
    res.clearCookie('refreshToken', refreshTokenCookieOptions);
    res.status(200).json({ message: 'Logged out.' });
  });

  router.post('/refresh', refreshRateLimiter, async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided.' });
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    if (isTokenRevoked(payload.jti)) {
      return res.status(401).json({ error: 'This refresh token has been revoked.' });
    }

    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    // Rotation: the refresh token just used is revoked immediately, and a
    // brand new one is issued alongside the new access token. If a refresh
    // token is ever stolen, this bounds how long it's useful for — it
    // works exactly once more before being replaced, rather than
    // remaining valid, unrotated, for its entire multi-day lifetime.
    revokeToken(payload.jti);
    issueSession(res, user);
    res.status(200).json({ message: 'Token refreshed.' });
  });

  return router;
}

export default createAuthRouter;
