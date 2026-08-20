// Tracks refresh tokens that have been explicitly revoked (e.g., via logout),
// so a token that is still cryptographically valid but has been logged out
// is nonetheless rejected. A real deployment would back this with a database
// or a fast key-value store (e.g., Redis) with a TTL matching the token's
// expiration, rather than an in-memory Set that resets on restart.

const revokedTokens = new Set();

function revoke(token) {
  revokedTokens.add(token);
}

function isRevoked(token) {
  return revokedTokens.has(token);
}

module.exports = { revoke, isRevoked };
