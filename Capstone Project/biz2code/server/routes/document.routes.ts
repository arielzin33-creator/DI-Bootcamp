/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   HTTP surface: POST /projects/:id/generate, GET /documents, GET /documents/:id/download
 * WHY       Routes declare shape only. No business logic here — it belongs in services, so it can be unit tested without HTTP.
 * DEPENDS   controllers/document.controller.ts
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Attach requireAuth to every route except register/login
 */

import { Router } from 'express';

export const documentRoutes = Router();

// TODO: POST /projects/:id/generate, GET /documents, GET /documents/:id/download
