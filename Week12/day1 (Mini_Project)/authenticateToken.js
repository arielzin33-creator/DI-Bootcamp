import { verifyAccessToken } from '../utils/tokens.js';

/**
 * Reads the access token from the `accessToken` httpOnly cookie (how this
 * app issues it — see `routes/auth.js`), falling back to an
 * `Authorization: Bearer <token>` header. The cookie is the primary path
 * the guide asks for; the header fallback costs nothing to support and is
 * what a non-browser API client (a mobile app, a server-to-server caller)
 * would use instead, since it can't rely on the browser's cookie jar.
 */
function extractToken(req) {
  if (req.cookies?.accessToken) return req.cookies.accessToken;

  const authHeader = req.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }

  return null;
}

export function authenticateToken(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (error) {
    // `TokenExpiredError` and `JsonWebTokenError` (bad signature, malformed
    // token) are both real, distinct outcomes a client benefits from
    // knowing apart: an expired token means "call /refresh"; a malformed
    // or invalid one means "something is wrong, don't retry the same way."
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Invalid access token.' });
  }
}
