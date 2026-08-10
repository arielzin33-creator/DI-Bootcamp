/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   HTTP surface: POST /projects/:id/phases/:n/approve, /revise
 * WHY       Routes declare shape only. No business logic here — it belongs in services, so it can be unit tested without HTTP.
 * DEPENDS   controllers/phase.controller.ts
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Attach requireAuth to every route except register/login
 */

import { Router } from 'express';

export const phaseRoutes = Router();

// TODO: POST /projects/:id/phases/:n/approve, /revise
