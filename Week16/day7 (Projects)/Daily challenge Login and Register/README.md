# React + Node/Express + PostgreSQL Login & Register

```
react-login-register/
├── server/           # Express API + Postgres access (knex, bcrypt)
│   ├── db/
│   │   ├── schema.sql       # run this once to create the tables
│   │   └── knex.js          # DB connection
│   ├── controllers/authController.js
│   ├── routes/authRoutes.js
│   ├── test.js               # end-to-end tests against a real Postgres DB
│   └── index.js
└── client/           # React app (Vite)
    └── src/
        ├── App.jsx            # routing + Dashboard (per the brief: "you can use App.js for the Dashboard")
        ├── api/authApi.js     # fetch wrappers for /register and /login
        └── components/
            ├── Navigation.jsx
            ├── RegisterForm.jsx
            └── LoginForm.jsx
```

## Setup

### 1. Database

A dedicated role and database, so this project never needs your Postgres superuser
password:

```bash
psql -U postgres -h localhost -c "CREATE ROLE auth_app_user WITH LOGIN PASSWORD 'auth_app_dev_pw'; CREATE DATABASE auth_app OWNER auth_app_user;"
```

Then create the two tables:

```bash
cd server
psql -U auth_app_user -h localhost -d auth_app -f db/schema.sql
```

### 2. Server

```bash
cd server
npm install
cp .env.example .env    # defaults already match the role/DB created above
npm start                 # http://localhost:4000
```

`npm test` runs the full suite against your real database (creates and cleans up its
own randomly-named test users each run — safe to run repeatedly, won't collide with
real data).

### 3. Client

```bash
cd client
npm install
cp .env.example .env    # VITE_API_URL, defaults to http://localhost:4000
npm run dev               # http://localhost:5173
```

## Design notes

**Two tables, on purpose.** `users` (name, email, joined date) holds profile data;
`login` (email, hash) holds only what's needed to authenticate. A leaked `users` export
(support tooling, analytics, a backup) never carries password hashes with it — they
physically don't exist in that table.

**Case-insensitive email uniqueness.** Postgres's `UNIQUE` constraint on `email` treats
`Alice@Example.com` and `alice@example.com` as different values. Without a case-folding
index, someone could register the same address twice under different casing, and a
login attempt with the "wrong" casing would fail to match. `schema.sql` adds a
`UNIQUE INDEX ON (LOWER(email))`; the server also normalizes to lowercase before every
query as defense in depth.

**One generic message per failure mode, both ends.** The brief asks for "already
registered" on a duplicate signup and "not registered" for a bad login — and
specifically, the *same* "not registered" message whether the email doesn't exist or
the password is wrong. That's deliberate: a different message per case would let a
client enumerate which emails are registered by trying logins against them.

**A transaction, not two independent inserts.** Registration writes to `users` and
`login` inside `knex.transaction(...)`. Without it, a crash between the two writes
could leave a `users` row with no matching `login` row (a permanently unloginable
account) or the reverse.

**A race condition, handled.** Two simultaneous registration requests for the same
email could both pass the "does it already exist" check before either commits — the
`UNIQUE` constraint is the real guard. The server catches Postgres's `23505`
(unique_violation) and returns the same "already registered" response instead of a raw
500.

## Verified

Actually run against a real PostgreSQL 18 database, not simulated — `server/test.js`
covers, against live Postgres:

- Registration validation (missing name, invalid email, short password)
- A successful registration — checked in the HTTP response *and* by querying the
  database directly to confirm rows landed in both `users` and `login`
- The stored value is a real bcrypt hash (`$2...` prefix), never the plaintext password
- Duplicate-email registration → `"already registered"`, including with different
  letter casing
- Correct login → 200 with user data
- Case-insensitive login (registered as lowercase, logged in with uppercase)
- Wrong password and unknown email both → `"not registered"`, and the two response
  bodies are asserted byte-for-byte identical
- `/health` confirms the server is actually talking to Postgres, not just running
