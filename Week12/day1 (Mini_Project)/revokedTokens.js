/**
 * A JWT is, by design, stateless and self-verifying — the server doesn't
 * need to look anything up to know a token is validly signed. That's
 * exactly what makes plain JWTs impossible to truly "log out": a signed,
 * unexpired token stays valid no matter what the server does, unless the
 * server keeps a record of tokens it has decided not to honor anymore.
 * This `Set` of revoked refresh-token ids is that record — deliberately
 * scoped to refresh tokens only. Access tokens stay short-lived (see
 * `config.js`) and are intentionally *not* checked against a revocation
 * list on every request, which would turn the stateless part of this
 * scheme back into a database lookup on every single request. Revoking
 * someone's session works by revoking their refresh token — the worst
 * case is that an already-issued access token remains valid for whatever
 * is left of its own short lifetime.
 */
const revokedTokenIds = new Set();

export function revokeToken(tokenId) {
  revokedTokenIds.add(tokenId);
}

export function isTokenRevoked(tokenId) {
  return revokedTokenIds.has(tokenId);
}

/** Test-only: returns to a clean slate between test files/cases. */
export function _resetRevokedTokensForTesting() {
  revokedTokenIds.clear();
}
