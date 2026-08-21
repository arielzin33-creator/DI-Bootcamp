/**
 * Real-time collaboration over WebSockets.
 *
 * Design:
 *   - One WebSocket endpoint at /ws, authenticated with the SAME access token the
 *     REST API uses. The brief: "Make sure that you're protecting the WebSocket
 *     endpoint by using the JWT."
 *   - Clients `join` a story room. Joining is only permitted if the user may edit
 *     that story, checked with `canEditStory` -- the exact same function the REST
 *     authorization middleware uses, so the two can never disagree.
 *   - `edit` and `cursor` messages are relayed to everyone else in the room.
 *
 * A note on what this is and isn't: relaying edits is a broadcast, not a conflict
 * resolution algorithm. Two people typing in the same paragraph at the same instant
 * will still race -- solving that properly needs CRDTs or operational transforms
 * (Yjs, ShareDB). This gives live shared editing for the realistic case of people
 * working in different parts of a story, which is what the brief asks for.
 */
import type { IncomingMessage, Server as HttpServer } from "node:http";
import { WebSocket, WebSocketServer, type RawData } from "ws";
import type { ClientMessage, CursorPosition, PeerPresence, ServerMessage } from "@storyapp/types";
import { extractBearerToken, verifyAccessToken } from "../helpers/tokens";
import { canEditStory } from "../models/contributorModel";
import { findUserById } from "../models/userModel";

/** Everything we track about one open connection. */
interface Client {
  socket: WebSocket;
  userId: number;
  username: string;
  avatarUrl: string | null;
  /** Story rooms this socket has joined. */
  rooms: Set<number>;
  cursors: Map<number, CursorPosition>;
  /** Heartbeat flag -- see the ping loop below. */
  isAlive: boolean;
}

const clients = new Map<WebSocket, Client>();
/** storyId -> the sockets currently in that room. */
const rooms = new Map<number, Set<WebSocket>>();

const MAX_MESSAGE_BYTES = 64 * 1024;

function send(socket: WebSocket, message: ServerMessage): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

/** Sends to everyone in the room except the originator. */
function broadcast(storyId: number, message: ServerMessage, exclude?: WebSocket): void {
  const room = rooms.get(storyId);
  if (!room) return;
  for (const socket of room) {
    if (socket !== exclude) send(socket, message);
  }
}

function presenceOf(client: Client, storyId: number): PeerPresence {
  return {
    userId: client.userId,
    username: client.username,
    avatar_url: client.avatarUrl,
    cursor: client.cursors.get(storyId) ?? null,
  };
}

function leaveRoom(socket: WebSocket, client: Client, storyId: number): void {
  const room = rooms.get(storyId);
  if (!room) return;

  room.delete(socket);
  client.rooms.delete(storyId);
  client.cursors.delete(storyId);

  if (room.size === 0) {
    // Don't leak an empty Set per story that was ever opened.
    rooms.delete(storyId);
  } else {
    broadcast(storyId, { type: "peer-left", storyId, userId: client.userId });
  }
}

/**
 * Pulls the access token off the upgrade request.
 *
 * Browsers cannot set headers on a WebSocket handshake, so the token normally arrives
 * as a query parameter. That is a little unfortunate (query strings tend to end up in
 * access logs), which is exactly why the access token is the short-lived one -- and
 * why the long-lived refresh token is never accepted here.
 */
function tokenFromRequest(request: IncomingMessage): string | null {
  const header = extractBearerToken(request.headers.authorization);
  if (header) return header;

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  return url.searchParams.get("token");
}

async function handleMessage(socket: WebSocket, client: Client, raw: RawData): Promise<void> {
  if (typeof raw !== "string" && (raw as Buffer).byteLength > MAX_MESSAGE_BYTES) {
    send(socket, { type: "error", message: "Message too large." });
    return;
  }

  let message: ClientMessage;
  try {
    message = JSON.parse(raw.toString()) as ClientMessage;
  } catch {
    send(socket, { type: "error", message: "Malformed message." });
    return;
  }

  if (!message || typeof message !== "object" || typeof message.type !== "string") {
    send(socket, { type: "error", message: "Malformed message." });
    return;
  }

  switch (message.type) {
    case "join": {
      const storyId = Number(message.storyId);
      if (!Number.isInteger(storyId) || storyId <= 0) {
        send(socket, { type: "error", message: "Invalid story id." });
        return;
      }

      // Authorisation, every time. A socket that was allowed into story 1 must not
      // be able to join story 2 just because the connection is already open.
      if (!(await canEditStory(storyId, client.userId))) {
        send(socket, { type: "error", message: "You are not allowed to edit this story." });
        return;
      }

      const room = rooms.get(storyId) ?? new Set<WebSocket>();
      room.add(socket);
      rooms.set(storyId, room);
      client.rooms.add(storyId);

      // Tell the newcomer who is already here...
      const peers: PeerPresence[] = [];
      for (const peerSocket of room) {
        if (peerSocket === socket) continue;
        const peer = clients.get(peerSocket);
        if (peer) peers.push(presenceOf(peer, storyId));
      }
      send(socket, { type: "joined", storyId, peers });

      // ...and tell everyone else about the newcomer.
      broadcast(
        storyId,
        { type: "peer-joined", storyId, peer: presenceOf(client, storyId) },
        socket,
      );
      return;
    }

    case "leave": {
      const storyId = Number(message.storyId);
      if (client.rooms.has(storyId)) leaveRoom(socket, client, storyId);
      return;
    }

    case "edit": {
      const storyId = Number(message.storyId);
      // Membership was authorised at join time, so this is a cheap in-memory check
      // rather than another database round trip on every keystroke.
      if (!client.rooms.has(storyId)) {
        send(socket, { type: "error", message: "Join the story before editing it." });
        return;
      }

      const title = typeof message.title === "string" ? message.title : undefined;
      const content = typeof message.content === "string" ? message.content : undefined;
      if (title === undefined && content === undefined) return;

      broadcast(
        storyId,
        { type: "edit", storyId, userId: client.userId, title, content },
        socket,
      );
      return;
    }

    case "cursor": {
      const storyId = Number(message.storyId);
      if (!client.rooms.has(storyId)) return;

      const cursor = message.cursor;
      if (
        !cursor ||
        typeof cursor.offset !== "number" ||
        typeof cursor.length !== "number" ||
        cursor.offset < 0 ||
        cursor.length < 0
      ) {
        return; // ignore junk rather than disconnecting a client over a stray message
      }

      const clean: CursorPosition = { offset: cursor.offset, length: cursor.length };
      client.cursors.set(storyId, clean);
      broadcast(storyId, { type: "cursor", storyId, userId: client.userId, cursor: clean }, socket);
      return;
    }

    default:
      send(socket, { type: "error", message: "Unknown message type." });
  }
}

/**
 * Notifies a story's room that the story was persisted, so other editors' copies are
 * replaced by the canonical server version. Called from the REST save path.
 */
export function broadcastSaved(storyId: number, story: import("@storyapp/types").Story): void {
  broadcast(storyId, { type: "saved", storyId, story });
}

export function attachWebSocketServer(server: HttpServer): WebSocketServer {
  // `noServer` so we can run the JWT check during the HTTP upgrade and reject
  // unauthenticated clients before a WebSocket is ever established.
  const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_MESSAGE_BYTES });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (url.pathname !== "/ws") {
      socket.destroy();
      return;
    }

    const token = tokenFromRequest(request);
    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    let userId: number;
    try {
      userId = verifyAccessToken(token).userId;
    } catch {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request, userId);
    });
  });

  wss.on("connection", (socket: WebSocket, _request: IncomingMessage, userId: number) => {
    // The .catch() is essential, not decorative: this IIFE runs outside any request,
    // so a rejection here (the database being unreachable, say) would surface as an
    // unhandled rejection and terminate the whole process -- taking every other
    // connected user down with it. Verified by actually pointing this at a dead
    // database, which crashed the server before this handler existed.
    void (async () => {
      // Look the user up once so every broadcast can carry a display name and avatar
      // without hitting the database per message.
      const user = await findUserById(userId);
      if (!user) {
        send(socket, { type: "error", message: "Account no longer exists." });
        socket.close();
        return;
      }

      const client: Client = {
        socket,
        userId,
        username: user.username,
        avatarUrl: user.avatar_url,
        rooms: new Set(),
        cursors: new Map(),
        isAlive: true,
      };
      clients.set(socket, client);

      send(socket, { type: "connected", userId });

      socket.on("pong", () => {
        client.isAlive = true;
      });

      socket.on("message", (raw) => {
        // Errors here must never escape: an unhandled rejection in a socket handler
        // would take the whole process down.
        handleMessage(socket, client, raw).catch((error: unknown) => {
          console.error("[ws] message handler failed:", error);
          send(socket, { type: "error", message: "Could not process that message." });
        });
      });

      socket.on("close", () => {
        for (const storyId of [...client.rooms]) leaveRoom(socket, client, storyId);
        clients.delete(socket);
      });

      socket.on("error", (error) => {
        console.error("[ws] socket error:", error.message);
      });
    })().catch((error: unknown) => {
      console.error("[ws] connection setup failed:", error);
      send(socket, { type: "error", message: "Could not establish the session." });
      socket.close();
    });
  });

  /**
   * Heartbeat. A dropped connection (laptop lid closed, tunnel died) often never
   * fires 'close', so without this the room would keep a ghost peer forever and keep
   * broadcasting to a socket nobody is reading.
   */
  const heartbeat = setInterval(() => {
    for (const [socket, client] of clients) {
      if (!client.isAlive) {
        socket.terminate();
        continue;
      }
      client.isAlive = false;
      socket.ping();
    }
  }, 30_000);

  wss.on("close", () => clearInterval(heartbeat));

  return wss;
}

/** Exposed for tests. */
export function connectionCount(): number {
  return clients.size;
}
