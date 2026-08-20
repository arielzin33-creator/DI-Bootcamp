import 'dotenv/config';
import crypto from 'node:crypto';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * A JWT secret has one job: being unguessable. A hardcoded string checked
 * into source control fails that job the moment the repository is public
 * (or even just shared), because anyone who can read the code can forge a
 * valid token for any user. There is no dev-only fallback for production —
 * if `JWT_SECRET` isn't set and `NODE_ENV=production`, this throws at
 * startup rather than quietly running with a guessable secret.
 *
 * The *development* fallback below exists purely so this project runs
 * out of the box in local testing without a `.env` file. It's generated
 * fresh at process startup (not a fixed string), which at least means it
 * won't sit in git history — but it is still not something to deploy.
 * `.env.example` documents the environment variables a real deployment
 * needs to set instead.
 */
function requireSecret(envVarName) {
  const value = process.env[envVarName];
  if (value) return value;

  if (isProduction) {
    throw new Error(
      `${envVarName} must be set via environment variable in production. Refusing to start with a fallback secret.`,
    );
  }

  console.warn(
    `[config] ${envVarName} is not set. Using a freshly-generated development-only secret ` +
      '— every restart invalidates existing tokens, and this must never be used in production.',
  );
  return crypto.randomBytes(48).toString('hex');
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: requireSecret('JWT_SECRET'),
  refreshSecret: requireSecret('REFRESH_TOKEN_SECRET'),
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  isProduction,
};
