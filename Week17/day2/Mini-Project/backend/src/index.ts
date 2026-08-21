/**
 * Server entry point. `npm start` runs the compiled version of this file.
 */
import http from "node:http";
import { createApp } from "./app";
import { config } from "./config/env";
import { pool } from "./db/pool";
import { attachWebSocketServer } from "./realtime/wsServer";

const app = createApp();

// An explicit http.Server (rather than app.listen) so the WebSocket server can hook
// into the same port's 'upgrade' event -- Render's free tier only exposes one port.
const server = http.createServer(app);
const wss = attachWebSocketServer(server);

server.listen(config.port, () => {
  console.log(`[server] listening on port ${config.port} (${config.nodeEnv})`);
  console.log(`[server] websocket endpoint at ws://localhost:${config.port}/ws`);
});

/**
 * Last line of defence for the brief's "the app should never crash" requirement.
 *
 * Anything that escapes the Express error handler -- a throw inside a timer, a rejected
 * promise nobody awaited -- lands here. We log it and keep serving rather than letting
 * Node's default behaviour terminate the process mid-request.
 */
process.on("unhandledRejection", (reason) => {
  console.error("[fatal] Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[fatal] Uncaught exception:", error);
});

/** Render sends SIGTERM on redeploy; close cleanly so in-flight requests finish. */
function shutdown(signal: string): void {
  console.log(`[server] ${signal} received, shutting down.`);
  wss.close();
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
  // Don't hang forever if a connection refuses to close.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
