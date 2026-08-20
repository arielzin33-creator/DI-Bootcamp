// Step 5: JWT secret keys and expiration times.
//
// SECURITY NOTE: these fall back to dev-only defaults so the project runs out of the box.
// In production, ALWAYS set real secrets via environment variables — a hardcoded secret in
// source control means anyone who reads your repo can forge valid tokens for any user.
// Access and refresh tokens use *different* secrets on purpose: if the access-token secret
// ever leaks, an attacker still cannot mint long-lived refresh tokens with it.

module.exports = {
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET || 'dev-only-access-secret-change-me',
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET || 'dev-only-refresh-secret-change-me',

  ACCESS_TOKEN_EXPIRES_IN: '1h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',

  // Cookie max-age in milliseconds, kept in sync with the JWT lifetimes above.
  ACCESS_COOKIE_MAX_AGE: 60 * 60 * 1000, // 1 hour
  REFRESH_COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days

  BCRYPT_ROUNDS: 10,

  PORT: process.env.PORT || 3000,
};
