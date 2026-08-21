/**
 * Centralised environment configuration.
 *
 * The brief asks us to "check the application environment (production or development)
 * and use the appropriate mechanism for loading the environment variables":
 *
 *   - development -> read a local `.env` file via dotenv.
 *   - production  -> do NOT read any file. Render (and every other PaaS) injects real
 *                    environment variables into the process, and a stray .env file in a
 *                    production image would silently shadow them.
 *
 * Everything is validated once, here, at startup. Failing loudly on boot is far better
 * than discovering at 2am that JWT_SECRET was undefined and `jwt.sign` has been happily
 * signing tokens with the string "undefined".
 */
import path from "node:path";

const nodeEnv = process.env.NODE_ENV ?? "development";
export const isProduction = nodeEnv === "production";

if (!isProduction) {
  // Loaded lazily so that `dotenv` is never even required in production.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dotenv = require("dotenv") as typeof import("dotenv");
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

/** Reads a required variable, or aborts startup with a clear message. */
function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        (isProduction
          ? "Set it in the Render dashboard under Environment."
          : "Copy backend/.env.example to backend/.env and fill it in."),
    );
  }
  return value;
}

/** Reads an optional variable, falling back to a default. */
function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : fallback;
}

export const config = {
  nodeEnv,
  isProduction,
  port: Number(optional("PORT", "4000")),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  refreshSecret: required("REFRESH_SECRET"),
  accessTokenTtl: optional("ACCESS_TOKEN_TTL", "15m"),
  refreshTokenTtl: optional("REFRESH_TOKEN_TTL", "7d"),
  /**
   * Allowed browser origins. A credentialed request (one that sends cookies) cannot
   * use the "*" wildcard -- the browser rejects it -- so this must list exact origins.
   */
  corsOrigins: optional("CORS_ORIGIN", "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  /**
   * Public origin of the FRONTEND, used to build share links.
   * Deliberately configured rather than derived from the request's Host header --
   * an attacker who controls Host could otherwise make us mint links to their domain.
   */
  publicAppUrl: optional("PUBLIC_APP_URL", "http://localhost:5173").replace(/\/+$/, ""),
  /**
   * Cloudinary credentials for avatar uploads. Optional: without them the avatar
   * upload endpoint returns a clear 503 and the UI falls back to pasting an image URL.
   */
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
} as const;

/**
 * Guard against the classic footgun of reusing one secret for both token types.
 * If they were equal, a refresh token would be accepted as an access token, handing
 * anyone with a stolen refresh token a 7-day-long access token.
 */
if (config.jwtSecret === config.refreshSecret) {
  throw new Error("JWT_SECRET and REFRESH_SECRET must be two different values.");
}
