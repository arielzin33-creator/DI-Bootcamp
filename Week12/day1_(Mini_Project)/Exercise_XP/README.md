# JWT Authentication in Node.js with Express — Step-by-Step Guide

A complete, working implementation of the checklist, plus all seven reinforcement exercises.

**Status: 35/35 automated tests passing.** Every endpoint below was exercised against a real
HTTP server — see [Verification](#verification) for how the test suite itself was validated.

```bash
npm install
npm start          # http://localhost:3000
npm test           # runs the 35-test suite
```

## Project structure

```
jwt-auth-guide/
├── app.js                          # Express app, middleware wiring, protected routes
├── config.js                       # secrets, token lifetimes, cookie max-ages
├── db.js                           # SQLite persistence (users + revoked_tokens)
├── tokens.js                       # sign / verify / revoke JWTs
├── validation.js                   # username, email, password, profile rules
├── test.js                         # 35-test end-to-end suite
├── routes/
│   └── authRoutes.js               # /auth/* endpoints
└── middleware/
    ├── authMiddleware.js           # JWT verification middleware
    └── rateLimit.js                # brute-force protection
```

> Note the deliberately distinct filenames: `authRoutes.js` and `authMiddleware.js` rather than
> two files both called `auth.js`. Same-name-different-folder is common in Express projects, but
> it makes editor tabs ambiguous, stack traces harder to read, and — most practically — the two
> files collide if they ever get downloaded or copied into a single flat directory.

---

## 1. Introduction to JSON Web Tokens

A JWT is a signed, URL-safe string with **three dot-separated parts**:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 . eyJzdWIiOjEsInVzZXJuYW1lIjoiYWxpY2UifQ . 5jGuSydZZYR0ans__qivj81emtU7vZy_y_nskzvhxBw
              HEADER                                PAYLOAD                                   SIGNATURE
```

Decode the first two parts yourself — no secret required, which is the whole point:

```js
Buffer.from('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', 'base64url').toString()
// -> {"alg":"HS256","typ":"JWT"}
Buffer.from('eyJzdWIiOjEsInVzZXJuYW1lIjoiYWxpY2UifQ', 'base64url').toString()
// -> {"sub":1,"username":"alice"}
```

| Part | Contains | Notes |
|---|---|---|
| **Header** | algorithm + token type (`{"alg":"HS256","typ":"JWT"}`) | base64url |
| **Payload** | claims — `sub`, `exp`, `iat`, plus your own | base64url |
| **Signature** | HMAC of `header.payload` using your secret | proves integrity |

> ⚠️ **The payload is encoded, not encrypted.** Anyone holding the token can read it. Never put
> a password hash, API key, or anything sensitive in a JWT payload. The signature guarantees the
> token *hasn't been tampered with* — not that its contents are private.

**Typical uses:** stateless authentication (the server doesn't store sessions), authorization
(roles/scopes in claims), and service-to-service auth.

**The tradeoff:** because JWTs are stateless, you can't "delete" one. A token stays valid until
it expires. That's exactly why this project implements a [revocation list](#exercise-4-token-revocation).

---

## 2. Setting Up the Application

```bash
mkdir jwt-auth-guide && cd jwt-auth-guide
npm init -y
npm install express --save
```

`app.js` sets up Express, mounts middleware, and wires the auth router.

## 3. Installing Dependencies

```bash
npm install express jsonwebtoken bcrypt body-parser cookie-parser express-rate-limit --save
```

| Package | Role |
|---|---|
| `jsonwebtoken` | sign + verify JWTs |
| `bcrypt` | hash passwords (slow by design — that's the point) |
| `body-parser` | parse JSON / urlencoded request bodies |
| `cookie-parser` | read cookies into `req.cookies` |
| `express-rate-limit` | brute-force protection |

Persistence uses **`node:sqlite`**, built into Node 22.5+, so there's no native module to
compile and no database server to run.

## 4. User Authentication Endpoints

`routes/authRoutes.js` holds the router; `db.js` creates the `users` table:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  bio TEXT,
  email_confirmed INTEGER NOT NULL DEFAULT 0,
  confirmation_token TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Registration validates input → checks for duplicates → hashes the password with bcrypt →
issues tokens. Login looks up the user → `bcrypt.compare()` → issues tokens.

> 🔒 **Login returns the same error for "no such user" and "wrong password."** Different messages
> would let an attacker enumerate valid usernames. There's a test asserting the two strings match.

## 5. Generating JWTs

See `tokens.js` and `config.js`.

- Access token: **1 hour**, signed with `ACCESS_TOKEN_SECRET`
- Refresh token: **7 days**, signed with a **different** `REFRESH_TOKEN_SECRET`

Two separate secrets means a leaked access-token secret still can't mint long-lived refresh
tokens. Each token carries `type: 'access' | 'refresh'`, and verification rejects the wrong type —
so a refresh token can't be replayed as an access token (tested).

Refresh tokens also carry a random `jti`. Without it, two refresh tokens minted for the same user
in the same second would be byte-identical, and revoking one would silently revoke the other.

## 6. Authentication Middleware

`middleware/authMiddleware.js` reads the token from an httpOnly cookie *or* an `Authorization: Bearer`
header, verifies it, loads the user, and attaches `req.user`.

| Situation | Status | Code |
|---|---|---|
| No token | 401 | — |
| Malformed / bad signature | 401 | `TOKEN_INVALID` |
| Expired | 401 | `TOKEN_EXPIRED` |
| Valid but user deleted | 401 | — |
| Valid but email unconfirmed (on `/vip`) | **403** | `EMAIL_NOT_CONFIRMED` |

401 vs 403 matters: 401 means *"I don't know who you are"*; 403 means *"I know who you are, and
you may not do this."* The distinct `TOKEN_EXPIRED` code tells a client to try `/refresh` rather
than dumping the user back to a login screen.

## 7. Securing Routes

```js
app.get('/dashboard', authenticate, (req, res) => { /* req.user is guaranteed */ });
router.get('/vip', authenticate, requireConfirmedEmail, handler);  // layered policy
```

`GET /auth/me` is the "special route for authentication" — it lets a client check whether its
token is still valid and get the user it belongs to.

## 8. HTTP Cookies for JWT Storage

```js
res.cookie('access_token', token, {
  httpOnly: true,                                  // JS can't read it -> mitigates XSS
  secure: process.env.NODE_ENV === 'production',   // HTTPS only in prod
  sameSite: 'strict',                              // mitigates CSRF
  maxAge: 60 * 60 * 1000,
});
```

The refresh cookie additionally sets `path: '/auth/refresh'`, so the browser only ever transmits
the long-lived token to the single endpoint that needs it.

## 9. Token Refresh

`POST /auth/refresh` verifies the refresh token and issues a new pair — **with rotation**: the
old refresh token is revoked on every use. A stolen refresh token is therefore only useful until
the legitimate user next refreshes.

Note the ordering in the code: the **revocation check runs before signature verification**. A
logged-out token is still cryptographically valid until it expires, so the revocation list is the
only thing that actually stops replay.

---

## Exercises

### Exercise 1: Registration validation
`validation.js`. Username 3–20 chars `[a-zA-Z0-9_]`; password ≥8 chars with upper, lower, and a
digit; RFC-ish email check. Errors return as an array so a UI can show all problems at once.

### Exercise 2: Profile updates
`PATCH /auth/profile` (protected). Partial updates — send `displayName`, `bio`, or both. The user
id comes from the **verified token**, never the request body, so one user can't edit another's
profile.

### Exercise 3: Logout invalidates refresh tokens
`POST /auth/logout` clears cookies **and** adds the refresh token to the revocation list. Clearing
cookies alone is security theater: anyone who captured the token value still holds a working
credential. There's a test asserting the token is dead after logout.

### Exercise 4: Token revocation
`revoked_tokens` table, keyed by **SHA-256 hash** of the token — if the database leaks, raw
refresh tokens in it would be directly replayable. Rows past their own `exp` are purged, since a
naturally-expired token can't be replayed anyway.

### Exercise 5: Persistent storage
SQLite via `node:sqlite` (`db.js`). Data survives restarts; set `DB_FILE=':memory:'` for tests.

### Exercise 6: Email confirmation
Registration generates a 32-byte `crypto.randomBytes` token. `GET /auth/confirm/:token` confirms
and clears it, so tokens are single-use. `/auth/vip` demonstrates gating a route on confirmation.

> The confirmation URL is returned in the registration response **only so the flow is testable
> without an SMTP server**. In production, email it — returning it hands anyone who can see the
> response the ability to confirm someone else's address.

### Exercise 7: Rate limiting
`middleware/rateLimit.js`. 10 attempts / 15 min on `/login`, `/register`, `/refresh`;
200 / 15 min globally. `skipSuccessfulRequests: true` means only *failed* attempts count, so
normal use never locks anyone out.

`app.set('trust proxy', 1)` — deliberately `1`, not `true`. Trusting all proxies lets a client
spoof `X-Forwarded-For` and defeat rate limiting entirely by presenting a fresh "IP" per request.

---

## API Reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/auth/register` | — | Create account |
| `POST` | `/auth/login` | — | Log in |
| `POST` | `/auth/refresh` | refresh token | New token pair |
| `POST` | `/auth/logout` | — | Clear cookies + revoke |
| `GET` | `/auth/confirm/:token` | — | Confirm email |
| `GET` | `/auth/me` | ✅ | Current user |
| `PATCH` | `/auth/profile` | ✅ | Update profile |
| `GET` | `/auth/vip` | ✅ + confirmed | Gated route |
| `GET` | `/dashboard` | ✅ | Example protected route |

### Try it

```bash
# Register
curl -s -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","email":"alice@example.com","password":"GoodPass1"}'

# Log in, keeping cookies
curl -s -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"GoodPass1"}'

# Protected route via cookie
curl -s -b cookies.txt http://localhost:3000/dashboard
```

---

## Verification

`npm test` runs 35 tests covering validation, registration, login, protected routes (cookie
*and* bearer), profile updates, email confirmation, refresh/rotation, logout/revocation, and
rate limiting.

A green suite only means something if the tests can actually fail, so the suite was
**mutation-tested** — deliberately breaking the implementation to confirm the tests notice:

| Mutation | Result |
|---|---|
| Disabled the revocation check in `/refresh` | ❌ 2 tests failed (rotation + logout revocation) |
| Replaced signature verification with `jwt.decode()` (accept forged tokens) | ❌ 2 tests failed (garbage token + wrong token type) |

Both mutations were caught, and only the relevant tests failed. Both were then reverted; the
suite is back to 35/35.

---

## Conclusion

**Key takeaways**

1. **Hash passwords with bcrypt, never store plaintext.** Bcrypt is deliberately slow, which is
   what makes offline cracking expensive.
2. **JWT payloads are readable by anyone.** Signing ≠ encryption.
3. **Statelessness is the tradeoff.** You gain scalability, but you can't revoke a token without
   adding state back — hence the revocation list.
4. **`httpOnly` cookies beat `localStorage`** for browser clients, because JS can't read them.
5. **Short access tokens + long refresh tokens with rotation** limit the blast radius of theft.
6. **Error messages are a security surface.** Identical login failures prevent user enumeration.

**Not implemented here** (deliberately out of scope, but needed for production): HTTPS/HSTS, CSRF
tokens for cookie-based flows, password reset, MFA, account lockout, audit logging, and real SMTP
delivery. Secrets must come from the environment — the defaults in `config.js` are dev-only.
