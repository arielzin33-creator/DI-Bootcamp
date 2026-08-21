# Collaborative Storytelling App

Users sign up, write stories, and invite other users to co-write them. Built as a
monorepo: an Express + PostgreSQL API, a React + TypeScript + Redux Toolkit frontend,
and a small package of TypeScript types shared by both.

Includes the advanced features — comments with reactions, real-time collaboration over
WebSockets, version history with diffs, profiles with avatars, share links, and tests.
See **[ADVANCED_FEATURES.md](ADVANCED_FEATURES.md)**.

```
.
├── backend/     Express + PostgreSQL API (TypeScript)
├── frontend/    React + Vite + Redux Toolkit + Tailwind/daisyUI (TypeScript)
├── types/       TypeScript interfaces shared by both sides
└── render.yaml  Optional Render blueprint for one-click deployment
```

---

## Quick start (local)

**Prerequisites:** Node 18+, npm, and a running PostgreSQL 14+ server.

```bash
# 1. Create a database
createdb storyapp

# 2. Backend
cd backend
cp .env.example .env          # then edit DATABASE_URL + the two secrets
npm install
npm run db:init               # creates all tables, indexes and the updated_at trigger
npm run dev                   # http://localhost:4000

# 3. Frontend (in a second terminal)
cd frontend
cp .env.example .env          # defaults to http://localhost:4000/api
npm install
npm run dev                   # http://localhost:5173
```

Generate the two secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Scripts

### `backend/`

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the API with `tsx watch` (restarts on file changes). |
| `npm run build` | Compiles TypeScript to `dist/`. |
| `npm start` | Runs the compiled server (`node dist/index.js`) — what Render uses. |
| `npm run db:init` | **Drops and recreates** every table from `src/db/schema.sql`. Refuses to run when `NODE_ENV=production` unless you pass `--force`. |
| `npm test` | Runs the logic tests (validation, JWT, header parsing). No database needed. |
| `npm run typecheck` | `tsc --noEmit`. |

### `frontend/`

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 5173. |
| `npm run build` | Typechecks, then builds to `dist/`. |
| `npm run preview` | Serves the production build locally. |
| `npm run typecheck` | `tsc --noEmit`. |

### Repo root

`npm run install:all`, `npm run dev:backend`, `npm run dev:frontend`, `npm run db:init`,
`npm run typecheck`, `npm run build` — convenience wrappers around the two packages.

---

## Environment variables

### `backend/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | no | `development` (default) or `production`. Decides whether `.env` is read at all and whether cookies are `Secure`. |
| `PORT` | no | Defaults to `4000`. Render injects its own. |
| `DATABASE_URL` | **yes** | PostgreSQL connection string. On Render use the **internal** one. |
| `JWT_SECRET` | **yes** | Signs 15-minute access tokens. |
| `REFRESH_SECRET` | **yes** | Signs 7-day refresh tokens. Must differ from `JWT_SECRET` — the app refuses to start otherwise. |
| `ACCESS_TOKEN_TTL` | no | Default `15m`. |
| `REFRESH_TOKEN_TTL` | no | Default `7d`. |
| `CORS_ORIGIN` | no | Comma-separated allowed origins. Default `http://localhost:5173`. Cannot be `*`, because the app sends credentials. |

The app validates all of these at startup and exits with a clear message if one is
missing, rather than failing mysteriously on the first request.

### `frontend/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | no | API base URL including `/api`. Defaults to `http://localhost:4000/api`. Baked in at **build** time. |

---

## How authentication works

1. **Register / log in** → the API returns a short-lived **access token** in the JSON
   body and sets a long-lived **refresh token** as an `httpOnly` cookie.
2. The access token is kept **in memory, in the Redux store** — never in
   `localStorage`, which any XSS payload can read. The refresh token is `httpOnly`, so
   JavaScript cannot read it at all.
3. Every authenticated request sends `Authorization: Bearer <access token>`.
4. When a request returns **401**, `frontend/src/app/api/client.ts` calls
   `POST /auth/refresh`, puts the new access token in the store, and **replays the
   original request** — so an expired token is invisible to the user.
5. On page reload the in-memory token is gone, so the app calls `/auth/refresh` once at
   startup to restore the session.
6. If refreshing fails, the user is sent to the login page.

Passwords are hashed with **bcrypt** (10 salt rounds) and never leave the database layer.

---

## API

All routes are prefixed with `/api`. Everything except `/health` and the auth routes
requires `Authorization: Bearer <token>`.

### Auth
| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `username`, `email`, `password` | 201 + session. Logs the user in immediately. |
| `POST` | `/auth/login` | `email`, `password` | 200 + session. |
| `POST` | `/auth/refresh` | — (uses cookie) | New access token. |
| `POST` | `/auth/logout` | — | 204, clears the cookie. |
| `GET` | `/auth/me` | — | The current user. |

### Stories
| Method | Path | Who may call it |
| --- | --- | --- |
| `GET` | `/stories` | Any logged-in user. `?mine=true` filters to your own. |
| `GET` | `/stories/:id` | Any logged-in user. |
| `POST` | `/stories` | Any logged-in user. |
| `PATCH` | `/stories/:id` | **Author or a listed collaborator.** |
| `DELETE` | `/stories/:id` | **Author only.** |

### Contributors
| Method | Path | Who may call it |
| --- | --- | --- |
| `POST` | `/contributors` (`story_id`, `user_id`) | **Author of that story only.** |
| `GET` | `/contributors/:story_id` | Any logged-in user. |
| `DELETE` | `/contributors/:id` | **Author of that story only.** |

### Comments & users
| Method | Path | Who may call it |
| --- | --- | --- |
| `GET` / `POST` | `/stories/:id/comments` | Any logged-in user. |
| `DELETE` | `/comments/:id` | The comment's author, or the story's author. |
| `GET` | `/users?search=` | Any logged-in user (min. 2 characters). |

**Status codes:** `400` invalid input · `401` not logged in / expired token ·
`403` logged in but not allowed · `404` missing · `409` duplicate · `500` unexpected.

---

## Database

Four tables — `users`, `stories`, `contributors`, `comments` — defined in
[`backend/src/db/schema.sql`](backend/src/db/schema.sql).

Three deliberate differences from the schema in the project brief, each of which
otherwise breaks at runtime:

1. **`updated_at` uses a trigger, not `ON UPDATE CURRENT_TIMESTAMP`.** That clause is
   MySQL syntax; PostgreSQL rejects it with a syntax error, so the brief's `CREATE
   TABLE Stories` cannot run at all on Postgres. The `set_updated_at()` trigger is the
   PostgreSQL equivalent.
2. **`ON DELETE CASCADE` on the foreign keys.** Without it, `DELETE /stories/:id`
   fails with a foreign-key violation the moment a story has any contributor or comment.
3. **`UNIQUE (story_id, user_id)` on `contributors`**, so the same collaborator cannot
   be added to a story twice.

---

## Security notes

- **SQL injection:** every query is parameterised (`$1`, `$2`, …) — see
  `backend/src/db/pool.ts`. The one place SQL is assembled dynamically
  (`updateStory`) builds the `SET` clause from a hard-coded allow-list of column names,
  never from user input.
- **Input validation happens server-side regardless of the frontend.** The React forms
  validate for the user's benefit; `backend/src/helpers/validation.ts` re-validates
  everything, including rejecting non-string values like `{"email": {"$ne": null}}`.
- **Errors never leak internals.** Only deliberate `ApiError`s reach the client; anything
  else is logged server-side and returned as a generic 500.
- **Secrets are never committed** — `.env` is gitignored; only `.env.example` (which has
  no real values) is tracked.

---

## Deploying to Render

You can commit [`render.yaml`](render.yaml) and use **New → Blueprint**, or create the
three services manually:

1. **PostgreSQL** — New → PostgreSQL. Copy its **Internal** connection string.
2. **Backend** — New → Web Service, root directory `backend`,
   Build `npm install && npm run build`, Start `node dist/index.js`.
   Environment: `NODE_ENV=production`, `DATABASE_URL` (the internal one), `JWT_SECRET`,
   `REFRESH_SECRET`, and `CORS_ORIGIN` set to your frontend's URL.
3. **Frontend** — New → Static Site, root directory `frontend`,
   Build `npm install && npm run build`, Publish Directory `dist`.
   Environment: `VITE_API_URL=https://<your-backend>.onrender.com/api`.
   Add a rewrite rule `/*` → `/index.html` so deep links survive a reload.

Then run the schema once against the Render database:

```bash
psql "<EXTERNAL connection string>" -f backend/src/db/schema.sql
```

### Two things that commonly break a first deploy

- **The refresh cookie never arrives.** In production the frontend and API are on
  different domains, so the cookie must be `SameSite=None; Secure`. This app already
  sets that (`backend/src/helpers/tokens.ts`) and sets `trust proxy`, without which
  Express considers Render's proxied connection insecure and refuses to send a `Secure`
  cookie at all.
- **CORS.** `CORS_ORIGIN` must be the frontend's exact origin. `*` is not allowed on
  requests that carry credentials.

---

## What is verified, and what is not

Verified by actually running it:

- `npm run typecheck` passes for both packages; both `npm run build`s succeed
  (backend → `dist/index.js`, frontend → `dist/` with Tailwind + daisyUI compiled).
- `npm test` in `backend/` — 66 checks (validation, JWT, header parsing, the diff
  algorithm, and live WebSocket JWT protection against a real server).
- `npm test` in `frontend/` — 33 Vitest + Testing Library tests, including the
  optimistic-reaction lifecycle and the comment permission matrix.
- `npm audit` reports **0 vulnerabilities** in both packages.
- The API was started and exercised over HTTP: `401` without a token, `400` on empty and
  malformed input, `404` on unknown routes, correct CORS headers for an allowed origin
  and none for a disallowed one, and — with the database deliberately unreachable — a
  generic `500` with the real error logged only server-side, the process staying up.
- **All SQL was parsed with PostgreSQL's own parser** (via `pglast`): `schema.sql`
  (20 statements), the migration (13), and all 46 queries in `models/` parse cleanly.
  The same check confirms the brief's `ON UPDATE CURRENT_TIMESTAMP` is a genuine
  `syntax error at or near "ON"` in PostgreSQL.

Not verified here:

- **Executing** the SQL against a live server — only parsing was possible, so the
  queries are proven syntactically valid but not proven to return the expected rows.
  Run `npm run db:init` followed by `npm test` against a real database to close this gap.
- A real Render deployment.
