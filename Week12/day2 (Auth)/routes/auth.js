const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const usersStore = require('../data/users');
const refreshTokenStore = require('../data/refreshTokenStore');
const validateCredentials = require('../middleware/validateCredentials');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, in ms

function signAccessToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

function signRefreshToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

function setRefreshTokenCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

// POST /auth/register
router.post('/register', validateCredentials, async (req, res) => {
  const { username, password } = req.body;

  if (usersStore.findByUsername(username)) {
    return res.status(409).json({ message: 'A user with that username already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = usersStore.createUser({ username, passwordHash });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({ message: 'User registered successfully.', accessToken });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const user = usersStore.findByUsername(username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({ message: 'Login successful.', accessToken });
});

// POST /auth/refresh
router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is missing.' });
  }

  if (refreshTokenStore.isRevoked(refreshToken)) {
    return res.status(403).json({ message: 'Refresh token has been revoked.' });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }

    const user = usersStore.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: 'User no longer exists.' });
    }

    const newAccessToken = signAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });
  });
});

// POST /auth/logout
// Clears the refresh token cookie AND revokes the token server-side, so a
// copy of the token captured before logout cannot be replayed at /refresh.
router.post('/logout', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    refreshTokenStore.revoke(refreshToken);
  }
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully.' });
});

// GET /auth/check — confirms whether the current access token is valid.
router.get('/check', authenticateToken, (req, res) => {
  res.status(200).json({ authenticated: true, user: req.user });
});

module.exports = router;
