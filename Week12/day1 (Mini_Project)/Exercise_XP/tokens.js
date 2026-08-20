// Step 5 (JWT generation) + Step 9 (refresh tokens) + revocation-list helpers.

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('./config');
const store = require('./db');

function signAccessToken(user) {
  // Only non-sensitive identifiers go in the payload. A JWT payload is base64url-encoded,
  // NOT encrypted — anyone holding the token can read it, so never put a password hash,
  // email-confirmation token, or similar in here.
  return jwt.sign(
    { sub: user.id, username: user.username, type: 'access' },
    config.ACCESS_TOKEN_SECRET,
    { expiresIn: config.ACCESS_TOKEN_EXPIRES_IN }
  );
}

function signRefreshToken(user) {
  // `jti` (JWT ID) gives each refresh token a unique identity. Without it, two refresh
  // tokens minted for the same user in the same second would be byte-identical, and
  // revoking one would silently revoke the other.
  return jwt.sign(
    { sub: user.id, username: user.username, type: 'refresh', jti: crypto.randomUUID() },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRES_IN }
  );
}

function verifyAccessToken(token) {
  const payload = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
  // Defense in depth: reject a refresh token presented where an access token is expected.
  if (payload.type !== 'access') throw new Error('Wrong token type');
  return payload;
}

function verifyRefreshToken(token) {
  const payload = jwt.verify(token, config.REFRESH_TOKEN_SECRET);
  if (payload.type !== 'refresh') throw new Error('Wrong token type');
  return payload;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function revokeRefreshToken(token) {
  let expiresAt = null;
  try {
    // decode(), not verify(): an already-expired token can still be revoked, and we only
    // need its `exp` here for revocation-table housekeeping.
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) expiresAt = decoded.exp;
  } catch {
    /* Unparseable token: revoke by hash with no expiry rather than failing the logout. */
  }
  store.revokeRefreshToken(hashToken(token), expiresAt);
}

function isRefreshTokenRevoked(token) {
  return store.isRefreshTokenRevoked(hashToken(token));
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  revokeRefreshToken,
  isRefreshTokenRevoked,
};
