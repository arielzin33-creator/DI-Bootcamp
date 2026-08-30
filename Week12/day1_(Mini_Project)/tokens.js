import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { config } from '../config.js';

export function generateAccessToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, config.jwtSecret, {
    expiresIn: config.accessTokenExpiry,
  });
}

/**
 * Refresh tokens carry a `jti` (JWT ID) — a random identifier unique to
 * this specific token, distinct from the user's own id. Revocation (see
 * `data/revokedTokens.js`) is keyed on `jti`, not on the user id, so
 * logging out of one session (one refresh token) doesn't invalidate every
 * other device or tab that has its own separately-issued refresh token.
 */
export function generateRefreshToken(user) {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ sub: user.id, jti }, config.refreshSecret, {
    expiresIn: config.refreshTokenExpiry,
  });
  return { token, jti };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.refreshSecret);
}
