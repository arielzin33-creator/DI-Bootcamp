/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   HTTP surface: GET /projects, POST /projects, GET /projects/:id
 * WHY       Routes declare shape only. No business logic here — it belongs in services, so it can be unit tested without HTTP.
 * DEPENDS   controllers/project.controller.ts
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Attach requireAuth to every route except register/login
 */

import { Router } from 'express';

export const projectRoutes = Router();

// TODO: GET /projects, POST /projects, GET /projects/:id
