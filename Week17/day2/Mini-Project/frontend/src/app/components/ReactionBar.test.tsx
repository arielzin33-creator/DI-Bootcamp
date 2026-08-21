/**
 * Component tests for the reaction buttons -- rendering, accessibility, and the
 * optimistic update reaching the store.
 */
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Reaction } from "@storyapp/types";
import ReactionBar from "./ReactionBar";
import { makeStore, renderWithStore, type TestState } from "../../test/renderWithStore";

const THUMB = "\u{1F44D}";

// The component dispatches a thunk that calls fetch. Stub it so the test stays a unit
// test -- what we care about here is the optimistic state change, not the network.
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise(() => {})), // never settles: leaves the thunk pending
  );
});

function stateWithComment(reactions: Reaction[]): Partial<TestState> {
  return {
    comments: {
      items: [
        {
          id: 1,
          story_id: 1,
          user_id: 7,
          comment_text: "hello",
          author: { id: 7, username: "ariel", email: "a@b.co", avatar_url: null },
          reactions,
          timestamp: "2026-01-01T00:00:00Z",
          edited_at: null,
        },
      ],
      status: "idle",
      error: null,
      editingId: null,
    },
  };
}

describe("ReactionBar", () => {
  it("renders one button per emoji in the palette", () => {
    renderWithStore(<ReactionBar commentId={1} reactions={[]} />);
    // Six emoji, matching ALLOWED_EMOJI on the backend.
    expect(screen.getAllByRole("button")).toHaveLength(6);
  });

  it("shows a count only for emoji that have been used", () => {
    renderWithStore(
      <ReactionBar commentId={1} reactions={[{ emoji: THUMB, count: 4, reacted: false }]} />,
    );
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("marks the emoji the current user picked with aria-pressed", () => {
    renderWithStore(
      <ReactionBar commentId={1} reactions={[{ emoji: THUMB, count: 1, reacted: true }]} />,
    );
    const pressed = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("aria-pressed") === "true");
    expect(pressed).toHaveLength(1);
    expect(pressed[0]).toHaveAccessibleName(`React with ${THUMB}`);
  });

  it("updates the count immediately on click, without waiting for the server", async () => {
    const user = userEvent.setup();
    const store = makeStore(stateWithComment([]));

    renderWithStore(<ReactionBar commentId={1} reactions={[]} />, { store });

    await user.click(screen.getByLabelText(`React with ${THUMB}`));

    // fetch is stubbed to never resolve, so if the tally changed it can only be the
    // optimistic path that did it.
    expect(store.getState().comments.items[0]!.reactions).toEqual([
      { emoji: THUMB, count: 1, reacted: true },
    ]);
  });

  it("un-reacting removes the tally optimistically", async () => {
    const user = userEvent.setup();
    const existing: Reaction[] = [{ emoji: THUMB, count: 1, reacted: true }];
    const store = makeStore(stateWithComment(existing));

    renderWithStore(<ReactionBar commentId={1} reactions={existing} />, { store });

    await user.click(screen.getByLabelText(`React with ${THUMB}`));

    expect(store.getState().comments.items[0]!.reactions).toEqual([]);
  });
});
