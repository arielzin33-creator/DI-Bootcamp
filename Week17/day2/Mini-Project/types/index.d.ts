/**
 * Types shared between the backend and the frontend.
 *
 * Everything in here is an `interface` or a `type` -- deliberately no runtime values
 * (no enums, no consts). That keeps this package erasable: both sides import it with
 * `import type`, so the import disappears at compile time and nothing has to be
 * bundled or resolved at runtime.
 */

/** A user as it is safe to expose over the API (never includes password_hash). */
export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
}

/** A story row joined with its author and contributors. */
export interface Story {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author: User | null;
  contributors: User[];
  comments_enabled: boolean;
  /** Present only when the author has generated a share link. */
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

/** A story as served publicly through a share link -- no ids, no emails. */
export interface SharedStory {
  title: string;
  content: string;
  author_name: string;
  updated_at: string;
}

/** One emoji tally on a comment. */
export interface Reaction {
  emoji: string;
  count: number;
  /** Whether the requesting user is one of the reactors. */
  reacted: boolean;
}

/** A comment on a story, joined with its author and reaction tallies. */
export interface Comment {
  id: number;
  story_id: number;
  user_id: number;
  comment_text: string;
  author: User | null;
  reactions: Reaction[];
  timestamp: string;
  edited_at: string | null;
}

/** A saved snapshot of a story. `content` is omitted from list responses. */
export interface Version {
  id: number;
  story_id: number;
  title: string;
  content: string;
  timestamp: string;
  created_by: number | null;
  created_by_name: string | null;
}

/** A version without its body, for the history list. */
export type VersionSummary = Omit<Version, "content">;

/** One line of a diff between two versions. */
export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  /** Line number in the older text, or null for added lines. */
  oldLine: number | null;
  /** Line number in the newer text, or null for removed lines. */
  newLine: number | null;
  text: string;
}

/** A public profile page. */
export interface Profile {
  user: User;
  authored: Story[];
  contributed: Story[];
  stats: {
    authored_count: number;
    contributed_count: number;
    comment_count: number;
  };
}

/* ------------------------------------------------------------------ *
 * Request payloads
 * ------------------------------------------------------------------ */

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateStoryPayload {
  title: string;
  content: string;
}

/** Both fields optional -- PATCH allows updating either one on its own. */
export interface UpdateStoryPayload {
  title?: string;
  content?: string;
  comments_enabled?: boolean;
}

export interface AddContributorPayload {
  story_id: number;
  user_id: number;
}

/** POST /comments takes the story id in the body, per the advanced brief. */
export interface CreateCommentPayload {
  story_id: number;
  comment_text: string;
}

export interface UpdateCommentPayload {
  comment_text: string;
}

export interface ToggleReactionPayload {
  emoji: string;
}

export interface UpdateProfilePayload {
  username?: string;
  avatar_url?: string | null;
}

/* ------------------------------------------------------------------ *
 * Response payloads
 * ------------------------------------------------------------------ */

/**
 * Returned by /auth/login, /auth/register and /auth/refresh.
 *
 * Only the *access* token appears here. The refresh token is never in the body --
 * it is set as an httpOnly cookie so JavaScript cannot read it.
 */
export interface AuthResponse {
  accessToken: string;
  user: User;
}

/** The shape every error response uses, so the frontend can rely on `message`. */
export interface ApiErrorResponse {
  message: string;
  /** Field-level validation errors, e.g. `{ email: "Email is not valid." }`. */
  errors?: Record<string, string>;
}

/** The claims we put into the JWTs. */
export interface JwtPayload {
  userId: number;
}

export interface ShareLinkResponse {
  share_token: string;
  /** Fully-qualified URL the client can copy or hand to a share button. */
  url: string;
}

/* ------------------------------------------------------------------ *
 * Realtime (WebSocket) messages
 * ------------------------------------------------------------------ */

/** Where a collaborator's caret is, for the Google-Docs-style presence display. */
export interface CursorPosition {
  /** Character offset into the story content. */
  offset: number;
  /** Selection length; 0 for a plain caret. */
  length: number;
}

/** Messages the browser sends to the server. */
export type ClientMessage =
  | { type: "join"; storyId: number }
  | { type: "leave"; storyId: number }
  | { type: "edit"; storyId: number; title?: string; content?: string }
  | { type: "cursor"; storyId: number; cursor: CursorPosition };

/** Messages the server sends to the browser. */
export type ServerMessage =
  | { type: "connected"; userId: number }
  | { type: "joined"; storyId: number; peers: PeerPresence[] }
  | { type: "peer-joined"; storyId: number; peer: PeerPresence }
  | { type: "peer-left"; storyId: number; userId: number }
  | { type: "edit"; storyId: number; userId: number; title?: string; content?: string }
  | { type: "cursor"; storyId: number; userId: number; cursor: CursorPosition }
  | { type: "saved"; storyId: number; story: Story }
  | { type: "error"; message: string };

export interface PeerPresence {
  userId: number;
  username: string;
  avatar_url: string | null;
  cursor: CursorPosition | null;
}
