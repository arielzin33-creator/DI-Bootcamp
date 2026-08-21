/**
 * The WebSocket client for live collaboration.
 *
 * Kept out of Redux deliberately: a WebSocket is a live, non-serialisable object, and
 * putting one in the store breaks time-travel debugging and RTK's serializability
 * check. The store holds the *facts* (who is here, what changed); this module owns
 * the connection.
 *
 * Like the REST client, it takes the token and dispatch as arguments rather than
 * importing the store, so there is no import cycle.
 */
import type { ClientMessage, ServerMessage } from "@storyapp/types";

type Dispatchable = (message: ServerMessage) => void;

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

/** Turns `http://host/api` into `ws://host/ws` (and https -> wss). */
export function socketUrl(token: string): string {
  const base = new URL(API_URL, window.location.origin);
  base.protocol = base.protocol === "https:" ? "wss:" : "ws:";
  // The API is mounted at /api; the socket lives at /ws on the same origin.
  // Trailing slashes are stripped FIRST: for a base of "http://host" the pathname is
  // "/", and appending straight onto it produced "//ws" -- a path the server never
  // matches. Caught by socket.test.ts rather than in production.
  base.pathname = base.pathname.replace(/\/+$/, "").replace(/\/api$/, "") + "/ws";
  // Browsers cannot set headers on a WebSocket handshake, so the (short-lived)
  // access token travels as a query parameter. The refresh token never does.
  base.search = `?token=${encodeURIComponent(token)}`;
  return base.toString();
}

let socket: WebSocket | null = null;
let onMessage: Dispatchable | null = null;
let reconnectTimer: number | null = null;
let shouldReconnect = false;
let currentToken: string | null = null;
/** Room to re-join automatically after a reconnect. */
let pendingStoryId: number | null = null;

function clearReconnect(): void {
  if (reconnectTimer !== null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

export function connectSocket(token: string, handler: Dispatchable): void {
  // Already connected with this token -- nothing to do.
  if (socket && socket.readyState === WebSocket.OPEN && currentToken === token) return;

  disconnectSocket();
  shouldReconnect = true;
  currentToken = token;
  onMessage = handler;

  socket = new WebSocket(socketUrl(token));

  socket.onmessage = (event: MessageEvent<string>) => {
    try {
      onMessage?.(JSON.parse(event.data) as ServerMessage);
    } catch {
      // A frame we cannot parse is not worth tearing the connection down over.
    }
  };

  socket.onclose = () => {
    socket = null;
    if (!shouldReconnect) return;
    // Retry after a short delay. The token may have expired, in which case the
    // handshake will 401 and we simply stop trying.
    clearReconnect();
    reconnectTimer = window.setTimeout(() => {
      if (shouldReconnect && currentToken) {
        connectSocket(currentToken, handler);
        if (pendingStoryId !== null) joinStory(pendingStoryId);
      }
    }, 2000);
  };

  socket.onerror = () => {
    // 'close' always follows, and that is where reconnection is handled.
  };
}

export function disconnectSocket(): void {
  shouldReconnect = false;
  pendingStoryId = null;
  clearReconnect();
  if (socket) {
    socket.onclose = null; // don't trigger the reconnect path on a deliberate close
    socket.close();
    socket = null;
  }
}

function send(message: ClientMessage): void {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

export function joinStory(storyId: number): void {
  pendingStoryId = storyId;
  send({ type: "join", storyId });
}

export function leaveStory(storyId: number): void {
  if (pendingStoryId === storyId) pendingStoryId = null;
  send({ type: "leave", storyId });
}

export function sendEdit(storyId: number, edit: { title?: string; content?: string }): void {
  send({ type: "edit", storyId, ...edit });
}

export function sendCursor(storyId: number, offset: number, length: number): void {
  send({ type: "cursor", storyId, cursor: { offset, length } });
}

/** Exposed for tests. */
export function isConnected(): boolean {
  return socket?.readyState === WebSocket.OPEN;
}
