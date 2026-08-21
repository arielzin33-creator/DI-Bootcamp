# Advanced features

The six optional features from the brief, built on top of the core app. See
[README.md](README.md) for setup, scripts and deployment.

If you already have a database with data in it, upgrade it in place rather than
re-running `db:init` (which drops everything):

```bash
psql "$DATABASE_URL" -f backend/src/db/migrations/002_advanced_features.sql
```

---

## 1. Comments system

The `comments` table uses the column names the brief specifies — `comment_text` and
`timestamp`. (`timestamp` is a type name in SQL; PostgreSQL nonetheless accepts it as
an unquoted column name in `SELECT`, `c.timestamp`, `ORDER BY` and `INSERT` column
lists — checked against PostgreSQL's own parser before committing to it.)

| Method | Path | Who |
| --- | --- | --- |
| `POST` | `/api/comments` — body `{ story_id, comment_text }` | any logged-in user |
| `GET` | `/api/comments/:story_id` | any logged-in user |
| `PATCH` | `/api/comments/:id` | **the comment's author only** |
| `DELETE` | `/api/comments/:id` | the comment's author **or** the story's author |
| `POST` | `/api/comments/:id/reactions` — body `{ emoji }` | any logged-in user (toggles) |

The story's author can delete any comment (moderation) but **cannot edit** one — putting
words in someone else's mouth is a different thing from removing them.

**Disabling comments.** `stories.comments_enabled` is toggled by the author from the
Story Viewer. `POST /comments` re-checks it server-side, so a direct API call cannot
post to a story with comments switched off.

**Reactions use optimistic updates.** Clicking updates the tally instantly:

1. `pending` — the reducer applies the change locally and the thunk stashes a snapshot
   of the previous tallies.
2. `fulfilled` — the server's authoritative tallies replace the local guess (not a
   no-op: other people react too).
3. `rejected` — the snapshot is restored *wholesale*. Rolling back to a snapshot rather
   than decrementing is what keeps double-clicks and concurrent failures correct.

The emoji palette is a fixed allow-list on both sides. Accepting arbitrary strings
would turn the column into free text that gets rendered to every reader.

## 2. Real-time collaboration

A WebSocket endpoint at `/ws`, on the same port as the API.

- **JWT-protected at the handshake.** The token is verified during the HTTP `upgrade`,
  so an unauthenticated client is rejected with a `401` before a socket exists. A
  *refresh* token is rejected here — only access tokens are accepted.
- **Joining a room re-checks permission** with `canEditStory`, the same function the
  REST authorization middleware uses, so live edits and `PATCH` can never disagree
  about who may edit.
- `edit` and `cursor` messages are relayed to everyone else in the story's room;
  `saved` tells the room to re-fetch after someone persists.
- Cursor positions drive the presence indicator (avatars + a tooltip showing where
  each collaborator is).
- A 30-second ping/pong heartbeat evicts sockets that died without closing cleanly.

**What this is not:** relaying edits is a broadcast, not conflict resolution. Two people
typing into the same paragraph at the same instant will still race — solving that
properly needs CRDTs or operational transforms (Yjs, ShareDB). This gives live shared
editing for the realistic case of people working in different parts of a story.

**Why the token is in the query string:** browsers cannot set headers on a WebSocket
handshake. Query strings can end up in access logs, which is exactly why only the
short-lived access token is accepted there, never the refresh token.

## 3. Version control

`versions` (`id, story_id, title, content, timestamp, created_by`).

- Every save snapshots the **previous** state, inside the same transaction as the
  `UPDATE` — so history can never record a save that then failed.
- Creating a story writes version 1, so history is never empty and the first edit has
  something to diff against.
- **Author only**, enforced in the controller on every version route.
- `GET /api/stories/:id/versions` — history list (bodies omitted; they can be large).
- `GET /api/versions/:id` — one version plus a diff against the one before it.
- `GET /api/versions/:id/diff?against=N` — diff any two versions of the same story.
- `POST /api/versions/:id/restore` — restoring is an ordinary save, so it snapshots the
  current text first and **a restore can itself be undone**.

The diff is a hand-written line-level LCS — the same idea `git diff` uses — rendered in
a red/green unified view with `+`/`-` markers so it stays readable without relying on
colour. Guarded at 5,000 lines, since LCS is O(n·m).

## 4. User profiles

`GET /api/users/:id/profile` returns the user, the stories they wrote, the stories they
collaborate on, and counts. `PATCH /api/users/me` updates username and avatar.

**Avatars use signed direct upload to Cloudinary:** the backend returns a short-lived
signature, the browser POSTs the image straight to Cloudinary, and only the resulting
URL is saved. The file never passes through our API (a 10 MB upload would otherwise tie
up a Node process on Render's free tier), and `CLOUDINARY_API_SECRET` never leaves the
server — an unsigned preset would let anyone upload into the account.

Cloudinary is **optional**. Without the env vars the endpoint returns a clear `503` and
the UI falls back to pasting an image URL. Pasted URLs are validated to be `http(s)`
only — a `javascript:` or `data:` URL would otherwise land in an `<img src>` rendered
for every other user.

## 5. Social sharing

- `POST /api/stories/:id/share` — author only; returns a link. Idempotent, so calling it
  twice does not invalidate a link already sent to someone.
- `DELETE /api/stories/:id/share` — revokes it.
- `GET /api/shared/:token` — **public**, mounted before any auth middleware.

The token is 24 random bytes, not the story id: a share link is a capability, so it must
not be guessable by counting upwards. The public response is deliberately reduced to
title, body, author display name and timestamp — no ids, no emails, no contributor list.

Share buttons for X and Facebook are hand-rolled rather than pulling in `react-share`:
the feature is two URL templates, and both the URL and title are `encodeURIComponent`'d
so a title containing `&` cannot rewrite the share URL.

## 6. Testing

**Backend** — `npm test` in `backend/`, 66 checks, no database or network needed:

- `tests/logic.test.ts` (49) — validation, JWT signing/verification, `Authorization`
  header parsing, the emoji allow-list, avatar-URL safety, share-token format.
- `tests/diff.test.ts` (10) — the LCS diff, including line numbering and the
  large-input guard.
- `tests/websocket.test.ts` (7) — a real server on a real port: rejects no token, a
  malformed token, a refresh token and the wrong path; accepts a valid access token;
  and degrades gracefully when the database is unreachable.

**Frontend** — `npm test` in `frontend/` (Vitest + Testing Library), 33 tests:

- `commentsSlice.test.ts` (10) — the optimistic reaction lifecycle: immediate apply,
  server reconciliation, exact rollback, and that `applyToggle` never mutates the
  snapshot the rollback depends on.
- `ReactionBar.test.tsx` (5) — rendering, `aria-pressed`, and that the count changes
  before the server replies (`fetch` is stubbed to never resolve, so only the
  optimistic path can be responsible).
- `CommentsSection.test.tsx` (8) — the edit/delete permission matrix and the
  comments-disabled state.
- `DiffView.test.tsx` (4) — renders every line, shows `+`/`-` markers.
- `socket.test.ts` (6) — WebSocket URL derivation, including `wss://` from `https://`.

`npm run test:coverage` produces a coverage report.

---

## Bugs found by these tests

Two real defects that typechecking alone did not catch:

1. **The WebSocket connection handler could crash the whole server.** Its setup runs in
   an async IIFE outside any request; without a `.catch()`, a database failure became
   an unhandled rejection that terminated the process — disconnecting every other user.
   Found by pointing the tests at a dead database. `tests/websocket.test.ts` now guards
   it by asserting the server still accepts connections after a failed setup.
2. **`socketUrl` produced `//ws`** when `VITE_API_URL` had no `/api` suffix, because the
   pathname was already `/`. A path the server never matches — and one that would only
   have shown up in a deployed environment.
