/**
 * Test environment setup.
 *
 * This has to be its own module, imported *first* by the test file. Plain
 * `process.env.X = "..."` statements at the top of the test would not work: ES module
 * imports are hoisted and evaluated before any statement in the importing file runs, so
 * src/config/env.ts would validate (and throw "Missing required environment variable
 * DATABASE_URL") before the assignments ever executed.
 *
 * Module *imports*, on the other hand, are evaluated in the order they appear -- so
 * importing this module before anything from src/ guarantees these are set in time.
 */
process.env.NODE_ENV = "development";
// Deliberately points at a closed port, NOT the default 5432: these tests must never
// reach a real database, not even by accident on a developer machine that happens to
// be running Postgres locally.
process.env.DATABASE_URL = "postgresql://user:pass@127.0.0.1:55999/nodb";
process.env.JWT_SECRET = "test_jwt_secret_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
process.env.REFRESH_SECRET = "test_refresh_secret_bbbbbbbbbbbbbbbbbbbbbbbbbbbb";
