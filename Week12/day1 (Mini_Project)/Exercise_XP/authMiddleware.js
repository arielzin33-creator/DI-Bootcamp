// Step 6: "Create JWT authentication middleware file."

const tokens = require('../tokens');
const store = require('../db');

// Accepts the token from either an httpOnly cookie (browser clients) or an
// `Authorization: Bearer <token>` header (API clients / mobile).
function extractAccessToken(req) {
  if (req.cookies && req.cookies.access_token) return req.cookies.access_token;

  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice('Bearer '.length);

  return null;
}

function authenticate(req, res, next) {
  const token = extractAccessToken(req);

  // 401 Unauthorized: no credentials presented at all.
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  let payload;
  try {
    payload = tokens.verifyAccessToken(token);
  } catch (err) {
    // Distinguishing expiry from a malformed/forged token lets a client know it should try
    // /refresh rather than forcing the user to log in again.
    if (err.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ error: 'Access token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token.', code: 'TOKEN_INVALID' });
  }

  const user = store.findUserById(payload.sub);
  // The token verified, but the user it names is gone (deleted account). Treat as
  // unauthenticated rather than trusting the token's claims about a nonexistent user.
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists.' });
  }

  req.user = user;
  req.tokenPayload = payload;
  next();
}

// Step 7 variant: for routes that additionally require a confirmed email address.
// 403 Forbidden (not 401): the user IS authenticated, they just lack permission.
function requireConfirmedEmail(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (!req.user.email_confirmed) {
    return res.status(403).json({
      error: 'Email address not confirmed. Check your inbox for the confirmation link.',
      code: 'EMAIL_NOT_CONFIRMED',
    });
  }
  next();
}

module.exports = { authenticate, requireConfirmedEmail, extractAccessToken };
