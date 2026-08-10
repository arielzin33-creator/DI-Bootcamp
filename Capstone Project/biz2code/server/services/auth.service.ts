/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Register, login, token issuance.
 * WHY       Single-user MVP. No roles, no tenant scoping — but user_id is already on projects, so multi-user is additive later rather than a rewrite.
 * DEPENDS   bcrypt, jsonwebtoken
 * ADR       ADR-005
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] bcrypt hash on register
 *   [ ] Sign a JWT with { userId }
 *   [ ] Set httpOnly + sameSite:'lax' cookie
 */

// TODO: register(email, password)
// TODO: login(email, password) -> token
// TODO: setAuthCookie(res, token)
