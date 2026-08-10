/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Process entry point. Starts the HTTP listener.
 * WHY       Kept separate from app.ts so tests can import the Express app without binding a port.
 * DEPENDS   app.ts, config/env.ts
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Read PORT from env
 *   [ ] Log the resolved port
 *   [ ] Handle EADDRINUSE with a readable message
 */

import { app } from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`biz2code API on http://localhost:${env.PORT}`);
});
