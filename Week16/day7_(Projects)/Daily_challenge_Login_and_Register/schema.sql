-- Run once against the auth_app database, e.g.:
--   psql -U auth_app_user -h localhost -d auth_app -f schema.sql

-- Two tables, matching the brief exactly: user profile data separated from auth
-- credentials, so a leaked "users" export (support tooling, analytics, backups)
-- never carries password hashes with it.

CREATE TABLE IF NOT EXISTS users (
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(255) NOT NULL,
    email  VARCHAR(255) UNIQUE NOT NULL,
    joined TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login (
    id       SERIAL PRIMARY KEY,
    hash     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) UNIQUE NOT NULL
);

-- Case-insensitive uniqueness: without this, "Alice@Example.com" and
-- "alice@example.com" would both pass Postgres's UNIQUE check as distinct rows,
-- letting someone register the same address twice under different casing while a
-- login attempt with the "wrong" casing fails to match. Applied to both tables since
-- both need to look a user up by email.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS login_email_lower_idx ON login (LOWER(email));
