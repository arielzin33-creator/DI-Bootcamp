# Sales Dashboard

A full-stack sales dashboard: sales users log in, manage a list of companies
("My Business"), record meeting summaries against those companies, and view
meeting statistics as charts.

## Stack

- **Frontend:** React (Vite), React Router, Chart.js (`react-chartjs-2`), axios
- **Backend:** Node.js + Express
- **Database:** SQLite (`better-sqlite3`) — a single file, no separate DB server to install
- **Auth:** JWT (`jsonwebtoken`), passwords hashed with `bcryptjs`

## Project structure

```
sales-dashboard/
  server/            Express API + SQLite database
    db.js            Schema (sales_users, company_business, meetings)
    seed.js           Creates the default sales user + sample data
    authMiddleware.js JWT verification middleware
    routes/
      authRoutes.js    POST /api/auth/login
      companyRoutes.js CRUD for companies
      meetingRoutes.js CRUD for meetings
      statsRoutes.js   Meeting statistics endpoints
    server.js          App entry point
  client/            React app (Vite)
    src/
      api/            One file per API resource (axios calls)
      context/        AuthContext (token/user state, persisted to localStorage)
      components/     Navbar, forms, lists, ProtectedRoute
      pages/          LoginPage, MyBusinessPage, MeetingsPage, StatisticsPage
```

## Setup — Local / Stage ENV

Both `server` and `client` run as two separate processes. This section covers
getting both running against each other, whether that's your laptop or a
staging box — the steps are identical, only the values you put in `.env`
differ (a real `JWT_SECRET`, the staging API's public URL for `VITE_API_URL`,
etc).

### Prerequisites

- Node.js 18+ and npm

### 1. Backend (`server/`)

```bash
cd server
npm install
cp .env.example .env      # optional — every value already has a working default
npm run seed               # creates the SQLite file, default user, and sample data
npm start                   # starts the API on http://localhost:4000
```

Default login created by the seed script (override via `SEED_USERNAME` /
`SEED_PASSWORD` in `.env` **before** running `npm run seed`):

```
username: sales
password: sales12345
```

The SQLite database file is written to `server/data/sales_dashboard.db`. It's
gitignored — each environment (dev, stage) gets its own file. Re-running
`npm run seed` is safe; it skips creating the user/sample data if they already
exist.

Environment variables (`server/.env.example`):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | API port |
| `JWT_SECRET` | dev value | **Set a real secret in any shared/staging environment** |
| `CORS_ORIGIN` | `http://localhost:5173` | Set to the deployed frontend's origin in stage |
| `SEED_USERNAME` / `SEED_PASSWORD` | `sales` / `sales12345` | The account `npm run seed` creates |

### 2. Frontend (`client/`)

```bash
cd client
npm install
cp .env.example .env      # optional — defaults to http://localhost:4000/api
npm run dev                # starts the dev server on http://localhost:5173
```

For a staging deployment, set `VITE_API_URL` in `client/.env` to the deployed
backend's URL (e.g. `https://sales-dashboard-api.staging.example.com/api`)
before running `npm run build`, then serve the `client/dist` output with any
static file host.

### 3. Use it

Open the frontend URL, log in with the seeded credentials above, and you'll
land on **My Business** with 3 sample companies and 7 sample meetings already
loaded (dated across the last ~2 weeks so the Statistics page has something
to chart immediately).

## API reference

All endpoints are under `/api`. Every endpoint except `/auth/login` requires
`Authorization: Bearer <token>`, obtained from login.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | `{ username, password }` → `{ token, user }` |
| GET | `/companies` | List all companies |
| POST | `/companies` | Create a company |
| GET | `/companies/:id` | Get one company |
| PUT | `/companies/:id` | Update a company |
| DELETE | `/companies/:id` | Delete a company (cascades to its meetings) |
| GET | `/meetings` | List all meetings, newest first, joined with business name |
| POST | `/meetings` | Create a meeting: `{ company_id, date, location, summary }` |
| GET | `/meetings/:id` | Get one meeting |
| PUT | `/meetings/:id` | Update a meeting |
| DELETE | `/meetings/:id` | Delete a meeting |
| GET | `/stats/meetings-per-day?days=30` | Meeting count for each of the last N days, zero-filled |
| GET | `/stats/meetings-this-month` | Total + per-day breakdown for the current calendar month |
| GET | `/stats/meetings-per-day-percentage` | Each day's meetings as a % of this month's total |

## Implementation notes

- Meetings reference an existing company by `company_id` (a dropdown of
  companies in the UI) rather than a free-text business name field — this
  keeps the data relationally consistent (renaming a company doesn't leave
  old meetings pointing at a stale name) while still satisfying the brief's
  "including... business name" requirement: the API always returns the
  joined `business_name` alongside every meeting.
- `meetings-per-day` zero-fills days with no meetings so the bar chart shows
  a real 30-day trend line instead of silently compressing gaps.
- The frontend never keeps a copy of the JWT secret or does its own token
  validation — an expired/invalid token simply gets a 401 from any request,
  which a shared axios response interceptor turns into "clear local session,
  redirect to /login".
- Deleting a company cascades to delete its meetings (`ON DELETE CASCADE` in
  the schema) rather than leaving orphaned rows or blocking the delete.
