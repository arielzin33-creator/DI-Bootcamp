// Step 4: "Create a router file to handle user registration and login routes."

const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcrypt');

const config = require('../config');
const store = require('../db');
const tokens = require('../tokens');
const { validateRegistration, validateProfileUpdate } = require('../validation');
const { authenticate, requireConfirmedEmail } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Step 8: "Set JWTs as HTTP cookies with the httpOnly option for enhanced security."
function cookieOptions(maxAge) {
  return {
    httpOnly: true, // blocks JavaScript access -> mitigates XSS token theft
    secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod
    sameSite: 'strict', // mitigates CSRF
    maxAge,
  };
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, cookieOptions(config.ACCESS_COOKIE_MAX_AGE));
  if (refreshToken) {
    // path is scoped to /auth/refresh so the browser only ever sends the long-lived
    // refresh token to the one endpoint that needs it, shrinking its exposure.
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions(config.REFRESH_COOKIE_MAX_AGE),
      path: '/auth/refresh',
    });
  }
}

// ---------------------------------------------------------------------------
// POST /auth/register
// ---------------------------------------------------------------------------
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body || {};

    const errors = validateRegistration({ username, email, password });
    if (errors.length) {
      return res.status(400).json({ error: 'Validation failed.', details: errors });
    }

    if (store.findUserByUsername(username)) {
      return res.status(409).json({ error: 'Username is already taken.' });
    }
    if (store.findUserByEmail(email)) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    // Exercise: "Implement email confirmation for user registration with unique tokens."
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    const user = store.createUser({
      username,
      email,
      passwordHash,
      displayName,
      confirmationToken,
    });

    const accessToken = tokens.signAccessToken(user);
    const refreshToken = tokens.signRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: 'Registration successful. Please confirm your email address.',
      user: store.toPublicUser(user),
      accessToken,
      // A real app emails this link instead of returning it. Exposed here only so the
      // flow is testable without an SMTP server — never do this in production, since it
      // hands anyone who can see the response the ability to confirm the address.
      confirmationUrl: `/auth/confirm/${confirmationToken}`,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = store.findUserByUsername(username);

    // Deliberately identical response for "no such user" and "wrong password". Different
    // messages would let an attacker enumerate which usernames exist.
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Step 9: issue BOTH an access token and a refresh token.
    const accessToken = tokens.signAccessToken(user);
    const refreshToken = tokens.signRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      message: 'Login successful.',
      user: store.toPublicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /auth/refresh  (Step 9)
// ---------------------------------------------------------------------------
router.post('/refresh', authLimiter, (req, res, next) => {
  try {
    const refreshToken =
      (req.cookies && req.cookies.refresh_token) || (req.body && req.body.refreshToken);

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided.' });
    }

    // Revocation check comes BEFORE signature verification: a logged-out token is still
    // cryptographically valid until it expires, so the revocation list is the only thing
    // that actually stops it being replayed.
    if (tokens.isRefreshTokenRevoked(refreshToken)) {
      return res
        .status(401)
        .json({ error: 'Refresh token has been revoked.', code: 'TOKEN_REVOKED' });
    }

    let payload;
    try {
      payload = tokens.verifyRefreshToken(refreshToken);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res
          .status(401)
          .json({ error: 'Refresh token expired. Please log in again.', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Invalid refresh token.', code: 'TOKEN_INVALID' });
    }

    const user = store.findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    // Refresh-token rotation: the old token is revoked and a new one issued on every use.
    // This means a stolen refresh token is only useful until the legitimate user next
    // refreshes — at which point the thief's copy is already dead.
    tokens.revokeRefreshToken(refreshToken);

    const newAccessToken = tokens.signAccessToken(user);
    const newRefreshToken = tokens.signRefreshToken(user);
    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({
      message: 'Token refreshed.',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /auth/logout  (Step 8 + revocation exercise)
// ---------------------------------------------------------------------------
router.post('/logout', (req, res, next) => {
  try {
    const refreshToken =
      (req.cookies && req.cookies.refresh_token) || (req.body && req.body.refreshToken);

    // Exercise: "Enhance the /logout endpoint to invalidate refresh tokens."
    // Clearing the cookie alone is NOT enough — anyone who captured the token value still
    // holds a working credential until it expires. It must go on the revocation list.
    if (refreshToken) {
      tokens.revokeRefreshToken(refreshToken);
    }

    res.clearCookie('access_token', { httpOnly: true, sameSite: 'strict' });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    store.purgeExpiredRevocations();

    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /auth/confirm/:token — email confirmation
// ---------------------------------------------------------------------------
router.get('/confirm/:token', (req, res, next) => {
  try {
    const user = store.findUserByConfirmationToken(req.params.token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or already-used confirmation token.' });
    }
    const confirmed = store.confirmUserEmail(user.id);
    res.json({
      message: 'Email confirmed successfully.',
      user: store.toPublicUser(confirmed),
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Step 7: protected routes
// ---------------------------------------------------------------------------

// "Create a special route for authentication" — lets a client check whether its current
// token is still valid, and get the user it belongs to.
router.get('/me', authenticate, (req, res) => {
  res.json({ authenticated: true, user: store.toPublicUser(req.user) });
});

// Exercise: "Develop a feature that allows authenticated users to update their profile."
router.patch('/profile', authenticate, (req, res, next) => {
  try {
    const { displayName, bio } = req.body || {};

    const errors = validateProfileUpdate({ displayName, bio });
    if (errors.length) {
      return res.status(400).json({ error: 'Validation failed.', details: errors });
    }

    const updated = store.updateUserProfile(req.user.id, {
      displayName: displayName !== undefined ? displayName : req.user.display_name,
      bio: bio !== undefined ? bio : req.user.bio,
    });

    res.json({ message: 'Profile updated.', user: store.toPublicUser(updated) });
  } catch (err) {
    next(err);
  }
});

// A protected route that ALSO requires a confirmed email — demonstrates layering two
// middlewares to express a stricter policy on a subset of routes.
router.get('/vip', authenticate, requireConfirmedEmail, (req, res) => {
  res.json({ message: `Welcome to the VIP area, ${req.user.username}!` });
});

module.exports = router;
