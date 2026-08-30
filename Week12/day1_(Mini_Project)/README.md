# JWT Authentication in Node.js with Express

A working, tested implementation of every step in the guide: registration, login, JWT access +
refresh tokens as httpOnly cookies, protected routes, token refresh with rotation, and refresh
token revocation.

## Running it

```bash
npm install
cp .env.example .env    # then edit JWT_SECRET / REFRESH_TOKEN_SECRET — see below
npm start                # or: npm run dev  (auto-restarts on file changes)
npm test                 # vitest run — 34 tests
```

Without a `.env` file at all, the app still starts in development — it generates a fresh
random secret at startup and prints a warning. **It refuses to start this way if
`NODE_ENV=production`** (verified directly: `NODE_ENV=production node -e "import('./src/config.js')..."`
throws `"JWT_SECRET must be set via environment variable in production."`). See `.env.example`
for what a real deployment needs to set.

## Two calibration decisions, stated up front

**Plain JavaScript, not TypeScript.** The guide's own instructions say `npm init -y` and
`app.js` — the previous several exercises in this series were TypeScript, but this one describes
a plain Node/Express project, so that's what's built. No `.ts` files, no build step beyond what
Node runs directly.

**Express 5, not Express 4.** Most JWT tutorials online (and a plausible guess from memory) still
assume Express 4. I checked rather than assumed: `npm view express version` returned `5.2.1`.
Express 5 actually simplifies one thing this project relies on — it automatically forwards a
rejected promise from an `async` route handler to the error-handling middleware, so none of the
`async` routes in `routes/auth.js` or `routes/profile.js` need their own `try/catch` just to avoid
an unhandled rejection crashing the process the way they would have under Express 4.

## File map

```
app.js                          Express app factory (no listen() — see below)
server.js                       starts the app on a real port
src/
  config.js                     env-var secrets, with the production guard
  data/users.js                 in-memory "users table" (see the DB-swap note below)
  data/revokedTokens.js         in-memory revoked-refresh-token registry
  utils/tokens.js                generate/verify access + refresh tokens
  utils/validation.js            registration input rules
  middleware/authenticateToken.js
  middleware/rateLimiters.js     factories — see the rate-limiter note below
  routes/auth.js                 /register /login /logout /refresh (also a factory)
  routes/profile.js              GET/PATCH /profile — protected
tests/                           vitest + supertest, 34 tests across 6 files
```

## Following the guide's own numbered steps

| Step | What it asked for | Where |
|---|---|---|
| 1 | Understand JWT structure/use cases | (conceptual — no code artifact) |
| 2 | Express app | `app.js` + `server.js` |
| 3 | Dependencies: jsonwebtoken, bcrypt, body-parser, cookie-parser | `package.json`; wired in `app.js` |
| 4 | Register/login routes, users table, hashing, JWT | `routes/auth.js`, `data/users.js` |
| 5 | JWTs with expiry and a secret | `utils/tokens.js`, `config.js` |
| 6 | Auth middleware, verify JWT, handle failure | `middleware/authenticateToken.js` |
| 7 | Protected routes, special auth-required route | `routes/profile.js` |
| 8 | Cookies, httpOnly, `/logout` | `routes/auth.js` |
| 9 | Access + refresh tokens, `/refresh` | `routes/auth.js` |

## Decisions worth explaining

**Access tokens expire in 15 minutes, not the guide's suggested "1 hour."** That suggestion
appears in step 5, before refresh tokens exist yet in the guide's own build order. Once step 9
adds a refresh-token flow, the standard, more secure pattern is a short-lived access token paired
with a longer-lived refresh token (7 days here) — a 1-hour access token with no way to refresh it
forces a full re-login every hour; a 1-hour access token *with* a refresh flow just means an
access token that's valid for an unnecessarily long window if it's ever leaked. 15 minutes is the
tighter, more defensible number once the refresh flow exists to make short-lived access tokens
practical at all.

**Refresh tokens carry their own `jti` (JWT ID), separate from the user's id.** Revocation is
keyed on `jti`, not on the user. That's what lets logging out of *one* session revoke *that*
session's refresh token without invalidating every other device or browser tab's independently-
issued refresh token.

**Refresh tokens rotate on every use — this goes beyond the guide's literal "issues new access
tokens."** Each call to `/refresh` immediately revokes the refresh token that was just used and
issues a brand new one alongside the new access token (`tests/refresh.test.js` verifies both the
rotation and that reusing the old token afterward is rejected). If a refresh token is ever stolen,
this bounds how long it's useful for — it works exactly once more before being replaced, rather
than remaining valid, unrotated, for its entire multi-day lifetime.

**Rate limiters and the auth router are both factory functions, not module-level singletons —
found because a naive version broke test isolation.** `express-rate-limit` keeps its request
counters in memory per middleware instance. A module-level `export const loginRateLimiter =
rateLimit(...)` (the more obvious way to write this) would mean every `createApp()` call —
including a fresh one built for every test file — shares the *same* counters, so one test file's
login attempts count against another file's rate limit for no reason related to what either test
is actually checking. `rateLimiters.js` exports factory functions instead, and `routes/auth.js`'s
`createAuthRouter()` builds fresh limiter instances every time it's called, giving every app
instance (real or test) fully independent rate-limit state.

**Login returns the identical status and message whether the username doesn't exist or the
password is wrong** (tested directly in `auth.test.js`), and compares against a fixed dummy bcrypt
hash when no user is found so the comparison still takes real time either way. Without this, the
login endpoint could be used to enumerate which usernames are registered at all, just from which
error message (or which response time) comes back.

**`data/users.js` is deliberately the *only* file that would need to change to swap in a real
database.** Every function in it is `async`, even though nothing in it currently awaits anything
— every call site elsewhere in the app already treats "look up a user" as a potentially-async
operation, so replacing the array with a real database client later is contained to this one file.

## What's genuinely built vs. what's a documented boundary

From the guide's own "Exercises to Reinforce" list, this project implements: registration
validation (`utils/validation.js`), refresh-token revocation and rotation (`data/revokedTokens.js`,
the `/refresh` and `/logout` handlers), a protected profile-update route (`routes/profile.js`),
and rate limiting on `/login` and `/refresh` (`middleware/rateLimiters.js`).

**Not built, and said plainly rather than silently skipped:** a real persistent database (the
in-memory store resets on every restart — `data/users.js`'s comment marks exactly where that swap
would happen) and email confirmation for registration (this needs real email-sending
infrastructure, which is a substantially different scope than anything else here).

## Validating it

34 tests across 6 files, all against a real running Express app via `supertest` (not mocked
HTTP) — `npm test` to run them. Beyond the automated suite, the core flow was also exercised
manually against a live server process with `curl`: register → protected `/profile` access →
`401` with no cookie → `PATCH /profile` → `/logout` → `401` after logout, and separately, the
full refresh-rotation sequence (register → refresh → confirm the refresh token changed → replay
the old one and confirm it's rejected as revoked → confirm the new one still works).
