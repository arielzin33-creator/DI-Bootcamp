/**
 * Smoke tests for the backend's pure logic -- validation, JWT handling and the
 * Authorization-header parsing. No database or network required, so this runs anywhere.
 *
 *     npm test
 *
 * Uses only node:assert, so the project needs no test-framework dependency.
 */
// MUST be the first import: it sets the environment variables that src/config/env.ts
// validates at import time. See tests/setupEnv.ts for why this cannot just be a few
// assignments at the top of this file.
import "./setupEnv";

import assert from "node:assert/strict";
import { ApiError } from "../src/helpers/ApiError";
import {
  extractBearerToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../src/helpers/tokens";
import {
  ALLOWED_EMOJI,
  parseId,
  parseShareToken,
  validateComment,
  validateEmoji,
  validateLogin,
  validateProfileUpdate,
  validateRegistration,
  validateStory,
  validateStoryUpdate,
} from "../src/helpers/validation";

let passed = 0;

function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log("  ok -", name);
}

function expectApiError(fn: () => unknown, status: number, name: string): void {
  check(name, () => {
    try {
      fn();
      assert.fail("expected an ApiError, but nothing was thrown");
    } catch (error) {
      assert.ok(error instanceof ApiError, `expected ApiError, got ${String(error)}`);
      assert.equal(error.status, status);
    }
  });
}

console.log("\n== extractBearerToken ==");
check("parses 'Bearer <token>'", () => {
  assert.equal(extractBearerToken("Bearer abc.def.ghi"), "abc.def.ghi");
});
check("scheme is case-insensitive", () => {
  assert.equal(extractBearerToken("bearer abc.def.ghi"), "abc.def.ghi");
});
check("rejects a bare token with no scheme", () => {
  assert.equal(extractBearerToken("abc.def.ghi"), null);
});
check("rejects undefined and empty", () => {
  assert.equal(extractBearerToken(undefined), null);
  assert.equal(extractBearerToken(""), null);
});

console.log("\n== JWT round trip ==");
check("an access token round-trips and carries userId", () => {
  assert.equal(verifyAccessToken(signAccessToken(42)).userId, 42);
});
check("a refresh token round-trips", () => {
  assert.equal(verifyRefreshToken(signRefreshToken(7)).userId, 7);
});
expectApiError(
  () => verifyAccessToken(signRefreshToken(1)),
  401,
  "a refresh token is rejected as an access token (the two secrets really are separate)",
);
expectApiError(() => verifyAccessToken("not.a.token"), 401, "a malformed token gives 401, not a crash");
check("passing the whole header into verify fails -- scheme must be stripped first", () => {
  const header = `Bearer ${signAccessToken(1)}`;
  assert.throws(() => verifyAccessToken(header));
  assert.equal(verifyAccessToken(extractBearerToken(header) as string).userId, 1);
});

console.log("\n== validateRegistration ==");
check("accepts a good payload, trims and lowercases the email", () => {
  assert.deepEqual(
    validateRegistration({ username: " Ariel ", email: "Ariel@Example.COM", password: "supersecret1" }),
    { username: "Ariel", email: "ariel@example.com", password: "supersecret1" },
  );
});
expectApiError(() => validateRegistration({}), 400, "an empty body is a 400");
expectApiError(
  () => validateRegistration({ username: "a", email: "nope", password: "supersecret1" }),
  400,
  "an invalid email is a 400",
);
expectApiError(
  () => validateRegistration({ username: "a", email: "a@b.co", password: "short" }),
  400,
  "a password under 8 characters is a 400",
);
expectApiError(
  () => validateRegistration({ username: "a", email: { $ne: null }, password: "supersecret1" }),
  400,
  "a non-string email (object injection attempt) is a 400, not passed through",
);
check("the password is never mangled by sanitisation", () => {
  const password = "  p@ss w0rd! with spaces  ";
  assert.equal(
    validateRegistration({ username: "u", email: "a@b.co", password }).password,
    password,
  );
});

console.log("\n== validateLogin ==");
expectApiError(() => validateLogin({ email: "", password: "" }), 400, "empty credentials are a 400");
check("accepts valid credentials", () => {
  assert.deepEqual(validateLogin({ email: "A@B.co", password: "x" }), {
    email: "a@b.co",
    password: "x",
  });
});

console.log("\n== validateStory / validateStoryUpdate ==");
check("accepts a story and trims it", () => {
  assert.deepEqual(validateStory({ title: " T ", content: " C " }), { title: "T", content: "C" });
});
expectApiError(() => validateStory({ title: "", content: "c" }), 400, "an empty title is a 400");
expectApiError(
  () => validateStory({ title: "t".repeat(256), content: "c" }),
  400,
  "a title longer than the VARCHAR(255) column is a 400, not a database error",
);
check("PATCH accepts either field on its own", () => {
  assert.deepEqual(validateStoryUpdate({ title: "New" }), { title: "New" });
  assert.deepEqual(validateStoryUpdate({ content: "New" }), { content: "New" });
});
expectApiError(() => validateStoryUpdate({}), 400, "PATCH with no fields at all is a 400");
expectApiError(() => validateStoryUpdate({ title: "   " }), 400, "PATCH with a blank title is a 400");

console.log("\n== validateComment ==");
// Takes the raw value, not the request body: POST /comments nests it as
// { story_id, comment_text }, so the controller passes body.comment_text in.
check("accepts a comment and trims it", () => {
  assert.equal(validateComment(" hi "), "hi");
});
expectApiError(() => validateComment(""), 400, "an empty comment is a 400");
expectApiError(() => validateComment("   "), 400, "a whitespace-only comment is a 400");
expectApiError(() => validateComment(undefined), 400, "a missing comment is a 400");
expectApiError(() => validateComment({ nope: 1 }), 400, "a non-string comment is a 400");
expectApiError(() => validateComment("x".repeat(2001)), 400, "an over-long comment is a 400");

console.log("\n== validateEmoji (reactions are a fixed palette) ==");
check("accepts an allowed emoji", () => {
  assert.equal(validateEmoji(ALLOWED_EMOJI[0]), ALLOWED_EMOJI[0]);
});
expectApiError(() => validateEmoji("\u{1F4A9}"), 400, "an emoji outside the palette is a 400");
expectApiError(
  () => validateEmoji("<script>alert(1)</script>"),
  400,
  "arbitrary text is rejected, so reactions cannot become a free-text field",
);
expectApiError(() => validateEmoji(""), 400, "an empty reaction is a 400");

console.log("\n== validateProfileUpdate (avatar URLs) ==");
check("accepts an https avatar URL", () => {
  assert.deepEqual(validateProfileUpdate({ avatar_url: "https://res.cloudinary.com/a/b.png" }), {
    avatar_url: "https://res.cloudinary.com/a/b.png",
  });
});
check("null clears the avatar", () => {
  assert.deepEqual(validateProfileUpdate({ avatar_url: null }), { avatar_url: null });
});
expectApiError(
  () => validateProfileUpdate({ avatar_url: "javascript:alert(1)" }),
  400,
  "a javascript: URL is rejected (it would land in an <img src> for every viewer)",
);
expectApiError(
  () => validateProfileUpdate({ avatar_url: "data:text/html;base64,PHNjcmlwdD4=" }),
  400,
  "a data: URL is rejected",
);
expectApiError(() => validateProfileUpdate({}), 400, "an empty profile patch is a 400");

console.log("\n== validateStoryUpdate: comments_enabled ==");
check("accepts a boolean comments_enabled", () => {
  assert.deepEqual(validateStoryUpdate({ comments_enabled: false }), { comments_enabled: false });
});
expectApiError(
  () => validateStoryUpdate({ comments_enabled: "false" }),
  400,
  "the string \"false\" is rejected (it would be truthy if trusted)",
);

console.log("\n== parseShareToken ==");
check("accepts a base64url token", () => {
  assert.equal(parseShareToken("abcDEF123_-xyzABCDEF123"), "abcDEF123_-xyzABCDEF123");
});
expectApiError(() => parseShareToken("short"), 400, "a too-short token is a 400");
expectApiError(() => parseShareToken("has spaces and !!"), 400, "a token with illegal characters is a 400");
expectApiError(() => parseShareToken(undefined), 400, "a missing token is a 400");

console.log("\n== parseId ==");
check("parses numeric ids from strings and numbers", () => {
  assert.equal(parseId("12"), 12);
  assert.equal(parseId(12), 12);
});
expectApiError(() => parseId("abc"), 400, "'abc' is a 400 (not a 500 from Postgres)");
expectApiError(() => parseId("-1"), 400, "a negative id is a 400");
expectApiError(() => parseId("1.5"), 400, "a non-integer id is a 400");
expectApiError(() => parseId(undefined), 400, "a missing id is a 400");

console.log(`\nALL ${passed} CHECKS PASSED\n`);
