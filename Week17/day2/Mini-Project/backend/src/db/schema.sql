-- ============================================================================
--  Collaborative Storytelling App -- PostgreSQL schema
--  Run with:  npm run db:init
-- ============================================================================
--
--  NOTE ON THE BRIEF'S SCHEMA
--  The schema in the project brief uses, on the Stories table:
--
--      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
--
--  `ON UPDATE CURRENT_TIMESTAMP` is MySQL syntax. PostgreSQL has no such column
--  clause and rejects it with a syntax error, so that CREATE TABLE cannot run as
--  written on the Postgres database this project is required to use. The
--  PostgreSQL way to auto-maintain `updated_at` is a BEFORE UPDATE trigger, which
--  is what this file does (see set_updated_at() below).
--
--  Two other fixes vs. the brief, both of which bite at runtime rather than at
--  create time:
--    * ON DELETE CASCADE on the foreign keys. Without it, `DELETE /stories/:id`
--      fails with a foreign-key violation as soon as the story has any
--      contributor or comment rows pointing at it.
--    * UNIQUE (story_id, user_id) on contributors, so `POST /contributors`
--      cannot silently add the same collaborator to a story twice.
--
--  The advanced-features tables (comments with reactions, versions) use the exact
--  column names the advanced brief specifies -- including a column literally named
--  `timestamp`. That is a type name in SQL, but PostgreSQL accepts it as an
--  unquoted column name in every position this app uses it (SELECT, qualified
--  `c.timestamp`, ORDER BY, INSERT column list) -- verified against PostgreSQL's
--  own parser rather than assumed.
-- ============================================================================

DROP TABLE IF EXISTS comment_reactions CASCADE;
DROP TABLE IF EXISTS versions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS contributors CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ---------------------------------------------------------------- users ----
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT         NOT NULL,
    -- Remote URL of the uploaded avatar (Cloudinary or any other host).
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------- stories ----
CREATE TABLE stories (
    id               SERIAL PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    content          TEXT         NOT NULL,
    author_id        INT          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    -- Lets the author turn the comments section off for a story.
    comments_enabled BOOLEAN      NOT NULL DEFAULT TRUE,
    -- Random opaque token for public share links; NULL until sharing is enabled.
    share_token      TEXT UNIQUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------- contributors ----
CREATE TABLE contributors (
    id         SERIAL PRIMARY KEY,
    story_id   INT NOT NULL REFERENCES stories (id) ON DELETE CASCADE,
    user_id    INT NOT NULL REFERENCES users (id)   ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (story_id, user_id)
);

-- ------------------------------------------------------------- comments ----
-- Column names follow the advanced brief: comment_text + timestamp.
CREATE TABLE comments (
    id           SERIAL PRIMARY KEY,
    story_id     INT  NOT NULL REFERENCES stories (id) ON DELETE CASCADE,
    user_id      INT  NOT NULL REFERENCES users (id)   ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    timestamp    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Set when the comment is edited, so the UI can show an "edited" marker.
    edited_at    TIMESTAMPTZ
);

-- ---------------------------------------------------- comment reactions ----
CREATE TABLE comment_reactions (
    id         SERIAL PRIMARY KEY,
    comment_id INT         NOT NULL REFERENCES comments (id) ON DELETE CASCADE,
    user_id    INT         NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    emoji      VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- One of each emoji per person per comment. This is what makes the toggle
    -- endpoint idempotent, and what stops a double-click from double-counting.
    UNIQUE (comment_id, user_id, emoji)
);

-- ------------------------------------------------------------- versions ----
-- One row per save, so a story's history can be viewed and restored.
CREATE TABLE versions (
    id         SERIAL PRIMARY KEY,
    story_id   INT          NOT NULL REFERENCES stories (id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    timestamp  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Who saved this version. SET NULL rather than CASCADE: deleting a user must
    -- not silently delete the story's history.
    created_by INT REFERENCES users (id) ON DELETE SET NULL
);

-- Indexes for the lookups this app actually performs.
CREATE INDEX idx_stories_author         ON stories (author_id);
CREATE INDEX idx_contributors_story     ON contributors (story_id);
CREATE INDEX idx_contributors_user      ON contributors (user_id);
CREATE INDEX idx_comments_story         ON comments (story_id);
CREATE INDEX idx_reactions_comment      ON comment_reactions (comment_id);
CREATE INDEX idx_versions_story         ON versions (story_id, timestamp DESC);

-- ------------------------------------------- updated_at trigger (Postgres) --
-- The PostgreSQL replacement for MySQL's ON UPDATE CURRENT_TIMESTAMP.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stories_set_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
