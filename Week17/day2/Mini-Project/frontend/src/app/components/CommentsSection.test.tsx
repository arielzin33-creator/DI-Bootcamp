/**
 * Tests for who can edit/delete a comment, and for the "comments disabled" state.
 *
 * These assert the *UI* half of the permission rules. The backend enforces the same
 * rules independently -- see backend/src/controllers/commentController.ts.
 */
import { screen } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Comment } from "@storyapp/types";
import CommentsSection from "./CommentsSection";
import { makeStore, renderWithStore, type TestState } from "../../test/renderWithStore";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
});

const STORY_AUTHOR_ID = 100;
const COMMENT_AUTHOR_ID = 7;
const STRANGER_ID = 999;

function comment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 1,
    story_id: 1,
    user_id: COMMENT_AUTHOR_ID,
    comment_text: "A thoughtful remark",
    author: { id: COMMENT_AUTHOR_ID, username: "ariel", email: "a@b.co", avatar_url: null },
    reactions: [],
    timestamp: "2026-01-01T00:00:00Z",
    edited_at: null,
    ...overrides,
  };
}

function storeFor(currentUserId: number, comments: Comment[] = [comment()]) {
  const preloaded: Partial<TestState> = {
    auth: {
      user: { id: currentUserId, username: "u", email: "u@b.co", avatar_url: null },
      accessToken: "token",
      status: "idle",
      error: null,
      fieldErrors: null,
      initialized: true,
    },
    comments: { items: comments, status: "idle", error: null, editingId: null },
  };
  return makeStore(preloaded);
}

function renderSection(currentUserId: number, commentsEnabled = true, comments?: Comment[]) {
  return renderWithStore(
    <CommentsSection
      storyId={1}
      storyAuthorId={STORY_AUTHOR_ID}
      commentsEnabled={commentsEnabled}
    />,
    { store: storeFor(currentUserId, comments) },
  );
}

describe("CommentsSection permissions", () => {
  it("the comment's author can edit and delete their own comment", () => {
    renderSection(COMMENT_AUTHOR_ID);
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("the story's author can delete but NOT edit someone else's comment", () => {
    renderSection(STORY_AUTHOR_ID);
    // Moderation is allowed; rewriting another person's words is not.
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("an unrelated user gets neither button", () => {
    renderSection(STRANGER_ID);
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });
});

describe("CommentsSection rendering", () => {
  it("shows the comment text and the count in the heading", () => {
    renderSection(STRANGER_ID);
    expect(screen.getByText("A thoughtful remark")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Comments \(1\)/ })).toBeInTheDocument();
  });

  it("marks an edited comment", () => {
    renderSection(STRANGER_ID, true, [comment({ edited_at: "2026-01-02T00:00:00Z" })]);
    expect(screen.getByText("(edited)")).toBeInTheDocument();
  });

  it("hides the composer and explains when comments are disabled", () => {
    renderSection(STRANGER_ID, false);
    expect(screen.getByText(/comments are turned off/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Add a comment...")).not.toBeInTheDocument();
  });

  it("shows the composer when comments are enabled", () => {
    renderSection(STRANGER_ID, true);
    expect(screen.getByPlaceholderText("Add a comment...")).toBeInTheDocument();
  });

  it("says so when there are no comments", () => {
    renderSection(STRANGER_ID, true, []);
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });
});
