/**
 * Live WebSocket tests: JWT protection of the /ws endpoint.
 *
 *     npx tsx tests/websocket.test.ts
 *
 * Starts a real HTTP + WebSocket server on a spare port and connects real clients.
 * No database is required for the handshake tests -- joining a story room does hit
 * the database, so that part is checked separately in the integration tests.
 */
import "./setupEnv";

import assert from "node:assert/strict";
import http from "node:http";
import { WebSocket } from "ws";
import { attachWebSocketServer } from "../src/realtime/wsServer";
import { signAccessToken, signRefreshToken } from "../src/helpers/tokens";

const PORT = 4788;
const BASE = `ws://127.0.0.1:${PORT}/ws`;

let passed = 0;
function ok(name: string): void {
  passed++;
  console.log("  ok -", name);
}

/**
 * Resolves with how the connection ended:
 *  - "open"        the handshake succeeded
 *  - "rejected"    the server refused the upgrade (401)
 */
function tryConnect(url: string): Promise<"open" | "rejected"> {
  return new Promise((resolve) => {
    const socket = new WebSocket(url);
    const finish = (result: "open" | "rejected") => {
      socket.removeAllListeners();
      if (socket.readyState === WebSocket.OPEN) socket.close();
      resolve(result);
    };
    socket.on("open", () => finish("open"));
    socket.on("error", () => finish("rejected"));
    // A refused upgrade shows up as an 'error'; guard in case neither fires.
    setTimeout(() => finish("rejected"), 4000);
  });
}

async function main(): Promise<void> {
  const server = http.createServer();
  const wss = attachWebSocketServer(server);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));

  console.log("\n== WebSocket JWT protection ==");

  assert.equal(await tryConnect(BASE), "rejected");
  ok("connection with NO token is rejected");

  assert.equal(await tryConnect(`${BASE}?token=garbage`), "rejected");
  ok("connection with a malformed token is rejected");

  // The refresh token is signed with a different secret and must not be accepted
  // as an access token here.
  assert.equal(await tryConnect(`${BASE}?token=${signRefreshToken(1)}`), "rejected");
  ok("a REFRESH token is rejected at the websocket endpoint");

  assert.equal(await tryConnect(`${BASE}?token=${signAccessToken(1)}`), "open");
  ok("a valid access token is accepted");

  // Any path other than /ws must be refused outright.
  assert.equal(await tryConnect(`ws://127.0.0.1:${PORT}/nope?token=${signAccessToken(1)}`), "rejected");
  ok("a websocket upgrade on the wrong path is refused");

  console.log("\n== graceful degradation with the database unreachable ==");

  // setupEnv points DATABASE_URL at a closed port on purpose, so establishing a
  // session (which looks the user up) fails here. What matters is HOW it fails:
  // the client must get an error frame and the process must stay alive.
  //
  // This is a regression test for a real crash: the connection handler is an async
  // IIFE, and without a .catch() this rejection became an unhandled rejection that
  // terminated the entire server -- killing every other connected user.
  const socket = new WebSocket(`${BASE}?token=${signAccessToken(1)}`);
  await new Promise<void>((resolve, reject) => {
    socket.on("open", () => resolve());
    socket.on("error", reject);
  });

  const frame = await new Promise<{ type: string; message?: string }>((resolve) => {
    socket.on("message", (raw) => resolve(JSON.parse(raw.toString())));
  });
  assert.equal(frame.type, "error");
  ok("a failed session setup sends an error frame instead of crashing");

  // The decisive check: the server is still accepting connections afterwards.
  assert.equal(await tryConnect(`${BASE}?token=${signAccessToken(2)}`), "open");
  ok("the server is still alive and accepting connections after the failure");

  socket.close();
  wss.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));

  console.log(`\nALL ${passed} WEBSOCKET CHECKS PASSED\n`);
}

main().catch((error: unknown) => {
  console.error("websocket tests failed:", error);
  process.exit(1);
});
