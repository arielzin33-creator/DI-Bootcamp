-- ============================================================================
--  Migration: advanced features
--  (comment editing + reactions, disabling comments, versions, avatars, sharing)
--
--  `npm run db:init` DROPS everything and recreates it from schema.sql, which is
--  fine while developing but destroys real data. Run this instead to upgrade a
--  database that already has stories in it:
--
--      psql "$DATABASE_URL" -f src/db/migrations/002_advanced_features.sql
--
--  Every statement is written to be safe to run twice (IF NOT EXISTS / IF EXISTS).
-- ============================================================================

BEGIN;

-- ------------------------------------------------------- users: avatars ----
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- --------------------------------------- stories: comments off + sharing ----
ALTER TABLE stories ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS share_token TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'stories_share_token_key'
    ) THEN
        ALTER TABLE stories ADD CONSTRAINT stories_share_token_key UNIQUE (share_token);
    END IF;
END $$;

-- ------------------------------------------- comments: rename to spec ----
-- The first version of this app used `content` / `created_at`; the advanced brief
-- specifies `comment_text` / `timestamp`.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'comments' AND column_name = 'content'
    ) THEN
        ALTER TABLE comments RENAME COLUMN content TO comment_text;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'comments' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE comments RENAME COLUMN created_at TO timestamp;
    END IF;
END $$;

ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- ---------------------------------------------------- comment reactions ----
CREATE TABLE IF NOT EXISTS comment_reactions (
    id         SERIAL PRIMARY KEY,
    comment_id INT         NOT NULL REFERENCES comments (id) ON DELETE CASCADE,
    user_id    INT         NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    emoji      VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (comment_id, user_id, emoji)
);

-- ------------------------------------------------------------- versions ----
CREATE TABLE IF NOT EXISTS versions (
    id         SERIAL PRIMARY KEY,
    story_id   INT          NOT NULL REFERENCES stories (id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    timestamp  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reactions_comment ON comment_reactions (comment_id);
CREATE INDEX IF NOT EXISTS idx_versions_story    ON versions (story_id, timestamp DESC);

-- Seed one baseline version per existing story, so histories don't start empty.
INSERT INTO versions (story_id, title, content, timestamp, created_by)
SELECT s.id, s.title, s.content, s.updated_at, s.author_id
FROM stories s
WHERE NOT EXISTS (SELECT 1 FROM versions v WHERE v.story_id = s.id);

COMMIT;
