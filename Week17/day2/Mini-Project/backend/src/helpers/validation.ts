/**
 * Input validation and sanitisation.
 *
 * The brief is explicit: "Never trust the user input even if you validated it in the
 * frontend." Every one of these runs server-side, regardless of what the React forms
 * already checked -- a request from curl or Postman never touches that React code.
 */
import { ApiError } from "./ApiError";

/** Practical email check. Deliberately not RFC 5322 -- that regex is a liability. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_TITLE_LENGTH = 255; // matches VARCHAR(255) in the schema
const MAX_CONTENT_LENGTH = 50_000;
const MAX_COMMENT_LENGTH = 2_000;
const MAX_USERNAME_LENGTH = 50; // matches VARCHAR(50)
const MAX_EMAIL_LENGTH = 100; // matches VARCHAR(100)
const MIN_PASSWORD_LENGTH = 8;
const MAX_URL_LENGTH = 2_000;

/**
 * Narrows an unknown JSON value to a trimmed string.
 * Returns "" for anything that is not a string, so a client sending
 * `{"email": {"$ne": null}}` or `{"title": ["a"]}` gets a validation error rather
 * than an unexpected object flowing into the query layer.
 */
function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Strips control characters, which have no business in stored text and render as
 * invisible junk later.
 *
 * Note this is NOT what protects us from SQL injection -- parameterised queries do
 * that (see db/pool.ts). This is about data hygiene.
 */
function sanitizeText(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, "");
}

export interface ValidatedRegistration {
  username: string;
  email: string;
  password: string;
}

export function validateRegistration(body: unknown): ValidatedRegistration {
  const source = (body ?? {}) as Record<string, unknown>;
  const username = sanitizeText(asString(source.username));
  const email = asString(source.email).toLowerCase();
  // Passwords are intentionally NOT trimmed of internal characters or sanitised:
  // they are hashed, never rendered, and mangling them would silently change the
  // password the user thinks they set.
  const password = typeof source.password === "string" ? source.password : "";

  const errors: Record<string, string> = {};

  if (!username) {
    errors.username = "Username is required.";
  } else if (username.length > MAX_USERNAME_LENGTH) {
    errors.username = `Username must be at most ${MAX_USERNAME_LENGTH} characters.`;
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Email is not valid.";
  } else if (email.length > MAX_EMAIL_LENGTH) {
    errors.email = `Email must be at most ${MAX_EMAIL_LENGTH} characters.`;
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest("Please correct the highlighted fields.", errors);
  }

  return { username, email, password };
}

export interface ValidatedLogin {
  email: string;
  password: string;
}

export function validateLogin(body: unknown): ValidatedLogin {
  const source = (body ?? {}) as Record<string, unknown>;
  const email = asString(source.email).toLowerCase();
  const password = typeof source.password === "string" ? source.password : "";

  const errors: Record<string, string> = {};
  if (!email) errors.email = "Email is required.";
  if (!password) errors.password = "Password is required.";

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest("All fields are required.", errors);
  }

  return { email, password };
}

export interface ValidatedStory {
  title: string;
  content: string;
}

export function validateStory(body: unknown): ValidatedStory {
  const source = (body ?? {}) as Record<string, unknown>;
  const title = sanitizeText(asString(source.title));
  const content = sanitizeText(asString(source.content));

  const errors: Record<string, string> = {};

  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be at most ${MAX_TITLE_LENGTH} characters.`;
  }

  if (!content) {
    errors.content = "Content is required.";
  } else if (content.length > MAX_CONTENT_LENGTH) {
    errors.content = `Content must be at most ${MAX_CONTENT_LENGTH} characters.`;
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest("Please correct the highlighted fields.", errors);
  }

  return { title, content };
}

export interface ValidatedStoryUpdate {
  title?: string;
  content?: string;
  comments_enabled?: boolean;
}

/**
 * PATCH semantics: every field is optional, but at least one must be present, and any
 * field that IS present still has to be valid. Sending `{}` is a client bug, so it is
 * a 400 rather than a silent no-op.
 */
export function validateStoryUpdate(body: unknown): ValidatedStoryUpdate {
  const source = (body ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const update: ValidatedStoryUpdate = {};

  if (source.title !== undefined) {
    const title = sanitizeText(asString(source.title));
    if (!title) errors.title = "Title cannot be empty.";
    else if (title.length > MAX_TITLE_LENGTH)
      errors.title = `Title must be at most ${MAX_TITLE_LENGTH} characters.`;
    else update.title = title;
  }

  if (source.content !== undefined) {
    const content = sanitizeText(asString(source.content));
    if (!content) errors.content = "Content cannot be empty.";
    else if (content.length > MAX_CONTENT_LENGTH)
      errors.content = `Content must be at most ${MAX_CONTENT_LENGTH} characters.`;
    else update.content = content;
  }

  if (source.comments_enabled !== undefined) {
    if (typeof source.comments_enabled !== "boolean") {
      errors.comments_enabled = "comments_enabled must be true or false.";
    } else {
      update.comments_enabled = source.comments_enabled;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest("Please correct the highlighted fields.", errors);
  }

  if (Object.keys(update).length === 0) {
    throw ApiError.badRequest("Provide a title, content or comments_enabled to update.");
  }

  return update;
}

/** Validates a comment body. Takes the raw value, since POST /comments nests it. */
export function validateComment(value: unknown): string {
  const commentText = sanitizeText(asString(value));

  if (!commentText) {
    throw ApiError.badRequest("Comment cannot be empty.", {
      comment_text: "Comment cannot be empty.",
    });
  }
  if (commentText.length > MAX_COMMENT_LENGTH) {
    throw ApiError.badRequest("Comment is too long.", {
      comment_text: `Comment must be at most ${MAX_COMMENT_LENGTH} characters.`,
    });
  }

  return commentText;
}

/**
 * Reactions are restricted to a fixed palette.
 *
 * Accepting arbitrary strings would turn the reaction column into a free-text field
 * that anyone could stuff with 16 characters of their choosing -- and which then gets
 * rendered to every other reader of the comment.
 */
export const ALLOWED_EMOJI = ["\u{1F44D}", "❤️", "\u{1F602}", "\u{1F62E}", "\u{1F389}", "\u{1F914}"] as const;

export function validateEmoji(value: unknown): string {
  const emoji = asString(value);
  if (!emoji) {
    throw ApiError.badRequest("An emoji is required.");
  }
  if (!ALLOWED_EMOJI.includes(emoji as (typeof ALLOWED_EMOJI)[number])) {
    throw ApiError.badRequest(`Unsupported reaction. Allowed: ${ALLOWED_EMOJI.join(" ")}`);
  }
  return emoji;
}

export interface ValidatedProfileUpdate {
  username?: string;
  avatar_url?: string | null;
}

export function validateProfileUpdate(body: unknown): ValidatedProfileUpdate {
  const source = (body ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const update: ValidatedProfileUpdate = {};

  if (source.username !== undefined) {
    const username = sanitizeText(asString(source.username));
    if (!username) errors.username = "Username cannot be empty.";
    else if (username.length > MAX_USERNAME_LENGTH)
      errors.username = `Username must be at most ${MAX_USERNAME_LENGTH} characters.`;
    else update.username = username;
  }

  if (source.avatar_url !== undefined) {
    if (source.avatar_url === null) {
      update.avatar_url = null; // null clears the avatar
    } else {
      const url = asString(source.avatar_url);
      if (!url) errors.avatar_url = "Avatar URL cannot be empty.";
      else if (url.length > MAX_URL_LENGTH) errors.avatar_url = "Avatar URL is too long.";
      else if (!isSafeHttpUrl(url)) {
        // Rejects `javascript:` and `data:` URLs, which would otherwise be written
        // straight into an <img src> and rendered for every other user.
        errors.avatar_url = "Avatar URL must be an http(s) URL.";
      } else update.avatar_url = url;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest("Please correct the highlighted fields.", errors);
  }
  if (Object.keys(update).length === 0) {
    throw ApiError.badRequest("Provide a username or avatar_url to update.");
  }

  return update;
}

/** True only for absolute http/https URLs. */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Parses a route parameter or body field that must be a positive integer id.
 *
 * Without this, `GET /stories/abc` would put the string "abc" straight into a query
 * against an INT column, and Postgres would raise `invalid input syntax for type
 * integer` -- a 500 caused by ordinary user input. This turns it into a clean 400.
 */
export function parseId(value: unknown, fieldName = "id"): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw ApiError.badRequest(`Invalid ${fieldName}.`);
  }
  return parsed;
}

/** Share tokens are opaque base64url strings, not numbers. */
export function parseShareToken(value: unknown): string {
  const token = asString(value);
  if (!token || !/^[A-Za-z0-9_-]{16,64}$/.test(token)) {
    throw ApiError.badRequest("Invalid share link.");
  }
  return token;
}
