// Exercise: "Replace in-memory user data with a persistent database storage solution."
//
// Uses node:sqlite — built into Node 22.5+, so there's no native module to compile and no
// external DB server to run. Data survives restarts in auth.db (or lives in memory when
// DB_FILE=':memory:', which the test suite uses for isolation).

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'auth.db');
const db = new DatabaseSync(DB_FILE);

// Step 4: "Create your users data table."
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    username           TEXT    NOT NULL UNIQUE,
    email              TEXT    NOT NULL UNIQUE,
    password_hash      TEXT    NOT NULL,
    display_name       TEXT,
    bio                TEXT,
    email_confirmed    INTEGER NOT NULL DEFAULT 0,
    confirmation_token TEXT,
    created_at         TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// Exercise: "Implement token revocation by maintaining a list of revoked refresh tokens."
// Storing a SHA-256 hash rather than the raw token: this table is a security control, and if
// the DB leaks, raw refresh tokens in it would be directly replayable by an attacker.
db.exec(`
  CREATE TABLE IF NOT EXISTS revoked_tokens (
    token_hash TEXT PRIMARY KEY,
    revoked_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at INTEGER
  );
`);

const statements = {
  insertUser: db.prepare(`
    INSERT INTO users (username, email, password_hash, display_name, confirmation_token)
    VALUES (?, ?, ?, ?, ?)
  `),
  findByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
  findByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  findById: db.prepare('SELECT * FROM users WHERE id = ?'),
  findByConfirmationToken: db.prepare('SELECT * FROM users WHERE confirmation_token = ?'),
  confirmEmail: db.prepare(
    'UPDATE users SET email_confirmed = 1, confirmation_token = NULL WHERE id = ?'
  ),
  updateProfile: db.prepare(
    'UPDATE users SET display_name = ?, bio = ? WHERE id = ?'
  ),
  revokeToken: db.prepare(
    'INSERT OR IGNORE INTO revoked_tokens (token_hash, expires_at) VALUES (?, ?)'
  ),
  isRevoked: db.prepare('SELECT 1 FROM revoked_tokens WHERE token_hash = ?'),
  purgeExpiredRevocations: db.prepare(
    'DELETE FROM revoked_tokens WHERE expires_at IS NOT NULL AND expires_at < ?'
  ),
};

module.exports = {
  db,

  createUser({ username, email, passwordHash, displayName, confirmationToken }) {
    const result = statements.insertUser.run(
      username,
      email,
      passwordHash,
      displayName ?? username,
      confirmationToken
    );
    return statements.findById.get(result.lastInsertRowid);
  },

  findUserByUsername: (username) => statements.findByUsername.get(username),
  findUserByEmail: (email) => statements.findByEmail.get(email),
  findUserById: (id) => statements.findById.get(id),
  findUserByConfirmationToken: (token) => statements.findByConfirmationToken.get(token),

  confirmUserEmail(id) {
    statements.confirmEmail.run(id);
    return statements.findById.get(id);
  },

  updateUserProfile(id, { displayName, bio }) {
    statements.updateProfile.run(displayName, bio, id);
    return statements.findById.get(id);
  },

  revokeRefreshToken(tokenHash, expiresAtSeconds) {
    statements.revokeToken.run(tokenHash, expiresAtSeconds ?? null);
  },

  isRefreshTokenRevoked: (tokenHash) => Boolean(statements.isRevoked.get(tokenHash)),

  // Housekeeping: once a revoked token is past its own expiry it can never be replayed
  // anyway, so keeping the row adds nothing but unbounded table growth.
  purgeExpiredRevocations() {
    statements.purgeExpiredRevocations.run(Math.floor(Date.now() / 1000));
  },

  // Strips password_hash and confirmation_token before any user object reaches a response.
  toPublicUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      bio: user.bio,
      emailConfirmed: Boolean(user.email_confirmed),
      createdAt: user.created_at,
    };
  },
};
