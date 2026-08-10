/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   HTTP surface: GET/POST /projects/:id/answers
 * WHY       Routes declare shape only. No business logic here — it belongs in services, so it can be unit tested without HTTP.
 * DEPENDS   controllers/answer.controller.ts
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Attach requireAuth to every route except register/login
 */

import { Router } from 'express';

export const answerRoutes = Router();

// TODO: GET/POST /projects/:id/answers
