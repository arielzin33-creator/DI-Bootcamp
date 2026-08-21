/**
 * Live-collaboration state: who else is in the story, and where their cursors are.
 *
 * The socket itself is NOT kept here -- a WebSocket is not serialisable and Redux
 * state must stay plain data. It lives in app/api/socket.ts; this slice holds only
 * the facts the UI renders.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CursorPosition, PeerPresence } from "@storyapp/types";

export interface RealtimeState {
  status: "disconnected" | "connecting" | "connected";
  /** Story room currently joined, if any. */
  storyId: number | null;
  peers: PeerPresence[];
  /** A remote edit that arrived and has not yet been folded into the editor. */
  lastRemoteEdit: { userId: number; title?: string; content?: string } | null;
  error: string | null;
}

const initialState: RealtimeState = {
  status: "disconnected",
  storyId: null,
  peers: [],
  lastRemoteEdit: null,
  error: null,
};

const realtimeSlice = createSlice({
  name: "realtime",
  initialState,
  reducers: {
    connecting(state) {
      state.status = "connecting";
      state.error = null;
    },
    connected(state) {
      state.status = "connected";
      state.error = null;
    },
    disconnected(state) {
      state.status = "disconnected";
      state.peers = [];
      state.storyId = null;
    },
    joined(state, action: PayloadAction<{ storyId: number; peers: PeerPresence[] }>) {
      state.storyId = action.payload.storyId;
      state.peers = action.payload.peers;
    },
    peerJoined(state, action: PayloadAction<PeerPresence>) {
      // Guard against duplicates: a peer with two tabs open would otherwise appear twice.
      if (!state.peers.some((peer) => peer.userId === action.payload.userId)) {
        state.peers.push(action.payload);
      }
    },
    peerLeft(state, action: PayloadAction<number>) {
      state.peers = state.peers.filter((peer) => peer.userId !== action.payload);
    },
    peerCursorMoved(
      state,
      action: PayloadAction<{ userId: number; cursor: CursorPosition }>,
    ) {
      const peer = state.peers.find((item) => item.userId === action.payload.userId);
      if (peer) peer.cursor = action.payload.cursor;
    },
    remoteEditReceived(
      state,
      action: PayloadAction<{ userId: number; title?: string; content?: string }>,
    ) {
      state.lastRemoteEdit = action.payload;
    },
    remoteEditApplied(state) {
      state.lastRemoteEdit = null;
    },
    realtimeError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearRealtimeError(state) {
      state.error = null;
    },
  },
});

export const {
  connecting,
  connected,
  disconnected,
  joined,
  peerJoined,
  peerLeft,
  peerCursorMoved,
  remoteEditReceived,
  remoteEditApplied,
  realtimeError,
  clearRealtimeError,
} = realtimeSlice.actions;

export default realtimeSlice.reducer;
