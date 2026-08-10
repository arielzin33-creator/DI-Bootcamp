/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   HTTP surface: POST /register, POST /login, POST /logout, GET /me
 * WHY       Routes declare shape only. No business logic here — it belongs in services, so it can be unit tested without HTTP.
 * DEPENDS   controllers/auth.controller.ts
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Attach requireAuth to every route except register/login
 */

import { Router } from 'express';

export const authRoutes = Router();

// TODO: POST /register, POST /login, POST /logout, GET /me
