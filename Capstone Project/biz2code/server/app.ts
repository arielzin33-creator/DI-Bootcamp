/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Builds the Express app: middleware chain and route mounting.
 * WHY       Middleware ORDER matters. cookieParser before auth (auth reads the cookie); error handler LAST.
 * DEPENDS   middleware/*, routes/*
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Mount all five route modules
 *   [ ] CORS with credentials:true for the Vite dev origin
 *   [ ] Confirm error middleware is registered last
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorHandler } from './middleware/error';
import { env } from './config/env';

export const app = express();

app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// TODO: app.use('/api/auth', authRoutes); ...etc

app.use(errorHandler);   // MUST stay last
