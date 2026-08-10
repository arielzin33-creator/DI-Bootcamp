/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Loads and validates environment variables once, at boot.
 * WHY       Fail fast. A missing GROQ_API_KEY should crash on startup, not mid-demo.
 * DEPENDS   dotenv
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Throw with the variable name if any required key is absent
 *   [ ] Never log secret values
 */

import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  GROQ_API_KEY: required('GROQ_API_KEY'),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? null,   // fallback, optional
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  LLM_FEEDBACK_ENABLED: process.env.LLM_FEEDBACK_ENABLED === 'true',  // ADR-011
};
