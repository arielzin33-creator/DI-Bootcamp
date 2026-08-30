import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { createAuthRouter } from './src/routes/auth.js';
import profileRoutes from './src/routes/profile.js';

/**
 * A factory function, not a module-level `const app = express()` — this is
 * what lets `tests/*.test.js` import a fresh app instance and drive it
 * directly with `supertest`, with no real port bound and no dependency on
 * `server.js` ever having been run.
 */
export function createApp() {
  const app = express();

  // The guide specifically asks for `body-parser`. In current Express,
  // `express.json()` / `express.urlencoded()` do the same job built in
  // (they've wrapped equivalent logic since Express 4.16) — `body-parser`
  // itself is what those built-ins are based on. Using it explicitly here
  // matches the instructions; either is fine for a real project today.
  app.use(bodyParser.json());
  app.use(cookieParser());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', createAuthRouter());
  app.use('/api/profile', profileRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found.' });
  });

  // Express 5 automatically forwards a rejected promise from an `async`
  // route handler to this error-handling middleware — none of the routes
  // above need their own `try/catch` around an unexpected failure just to
  // avoid an unhandled rejection crashing the process, the way they would
  // have under Express 4.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}

export default createApp;
