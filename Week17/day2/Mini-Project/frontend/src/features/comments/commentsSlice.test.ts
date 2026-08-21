/**
 * Unit tests for the optimistic reaction logic.
 *
 * This is the part of the app most likely to go subtly wrong -- the UI changes before
 * the server has agreed, so the rollback path has to be exactly right.
 */
import { describe, expect, it } from "vitest";
import type { Comment, Reaction } from "@storyapp/types";
import reducer, { applyToggle, toggleReaction } from "./commentsSlice";

const THUMB = "\u{1F44D}";
const HEART = "❤️";

function makeComment(reactions: Reaction[]): Comment {
  return {
    id: 1,
    story_id: 1,
    user_id: 7,
    comment_text: "hello",
    author: { id: 7, username: "ariel", email: "a@b.co", avatar_url: null },
    reactions,
    timestamp: "2026-01-01T00:00:00Z",
    edited_at: null,
  };
}

const baseState = (reactions: Reaction[]) => ({
  items: [makeComment(reactions)],
  status: "idle" as const,
  error: null,
  editingId: null,
});

describe("applyToggle", () => {
  it("adds a brand-new reaction with count 1", () => {
    expect(applyToggle([], THUMB)).toEqual([{ emoji: THUMB, count: 1, reacted: true }]);
  });

  it("increments someone else's existing reaction", () => {
    expect(applyToggle([{ emoji: THUMB, count: 3, reacted: false }], THUMB)).toEqual([
      { emoji: THUMB, count: 4, reacted: true },
    ]);
  });

  it("decrements when un-reacting", () => {
    expect(applyToggle([{ emoji: THUMB, count: 3, reacted: true }], THUMB)).toEqual([
      { emoji: THUMB, count: 2, reacted: false },
    ]);
  });

  it("removes the tally entirely when the last reaction is withdrawn", () => {
    // Leaving a `count: 0` entry behind would render an empty badge forever.
    expect(applyToggle([{ emoji: THUMB, count: 1, reacted: true }], THUMB)).toEqual([]);
  });

  it("leaves other emoji untouched", () => {
    const before: Reaction[] = [
      { emoji: THUMB, count: 1, reacted: true },
      { emoji: HEART, count: 5, reacted: false },
    ];
    expect(applyToggle(before, HEART)).toEqual([
      { emoji: THUMB, count: 1, reacted: true },
      { emoji: HEART, count: 6, reacted: true },
    ]);
  });

  it("does not mutate the array it was given", () => {
    const before: Reaction[] = [{ emoji: THUMB, count: 1, reacted: false }];
    const snapshot = structuredClone(before);
    applyToggle(before, THUMB);
    // Mutating would corrupt the very snapshot the rollback depends on.
    expect(before).toEqual(snapshot);
  });
});

describe("optimistic reaction lifecycle", () => {
  const arg = { commentId: 1, emoji: THUMB, previous: [] as Reaction[] };

  it("applies the change immediately on pending, before the server replies", () => {
    const state = reducer(baseState([]), {
      type: toggleReaction.pending.type,
      meta: { arg },
    });
    expect(state.items[0]!.reactions).toEqual([{ emoji: THUMB, count: 1, reacted: true }]);
  });

  it("replaces the optimistic guess with the server's tallies on success", () => {
    const optimistic = reducer(baseState([]), {
      type: toggleReaction.pending.type,
      meta: { arg },
    });

    // The server knows two other people reacted while our request was in flight.
    const serverTruth: Reaction[] = [{ emoji: THUMB, count: 3, reacted: true }];
    const settled = reducer(optimistic, {
      type: toggleReaction.fulfilled.type,
      payload: { commentId: 1, reactions: serverTruth },
    });

    expect(settled.items[0]!.reactions).toEqual(serverTruth);
  });

  it("rolls back to the snapshot when the request fails", () => {
    const previous: Reaction[] = [{ emoji: THUMB, count: 2, reacted: false }];

    const optimistic = reducer(baseState(previous), {
      type: toggleReaction.pending.type,
      meta: { arg: { ...arg, previous } },
    });
    // Optimistically bumped...
    expect(optimistic.items[0]!.reactions).toEqual([{ emoji: THUMB, count: 3, reacted: true }]);

    const rolledBack = reducer(optimistic, {
      type: toggleReaction.rejected.type,
      payload: { commentId: 1, previous, message: "Network error." },
    });

    // ...and restored exactly, not merely decremented.
    expect(rolledBack.items[0]!.reactions).toEqual(previous);
    expect(rolledBack.error).toBe("Network error.");
  });

  it("ignores a toggle for a comment that is no longer loaded", () => {
    const state = reducer(baseState([]), {
      type: toggleReaction.pending.type,
      meta: { arg: { ...arg, commentId: 999 } },
    });
    // Must not throw, and must not invent a comment.
    expect(state.items).toHaveLength(1);
    expect(state.items[0]!.reactions).toEqual([]);
  });
});
