// Step 2/3: basic Express application + middleware wiring.

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const { authenticate } = require('./middleware/authMiddleware');
const { generalLimiter } = require('./middleware/rateLimit');
const store = require('./db');

const app = express();

// Needed for express-rate-limit to read the real client IP when behind a proxy.
// Set to 1 (not `true`): trusting ALL proxies lets a client spoof X-Forwarded-For and
// sidestep rate limiting entirely by presenting a new "IP" on every request.
app.set('trust proxy', 1);

// Step 3: middleware setup.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Step 8: enable cookie handling
app.use(generalLimiter);

// Public route.
app.get('/', (req, res) => {
  res.json({
    message: 'JWT Auth API',
    endpoints: {
      'POST /auth/register': 'Create an account (public)',
      'POST /auth/login': 'Log in, receive access + refresh tokens (public)',
      'POST /auth/refresh': 'Exchange a refresh token for a new access token (public)',
      'POST /auth/logout': 'Clear cookies and revoke the refresh token (public)',
      'GET /auth/confirm/:token': 'Confirm an email address (public)',
      'GET /auth/me': 'Current user (protected)',
      'PATCH /auth/profile': 'Update your profile (protected)',
      'GET /auth/vip': 'Requires a confirmed email (protected)',
      'GET /dashboard': 'Example protected route',
    },
  });
});

app.use('/auth', authRoutes);

// Step 7: "Define protected routes... Apply the JWT authentication middleware."
app.get('/dashboard', authenticate, (req, res) => {
  res.json({
    message: `Welcome to your dashboard, ${req.user.username}.`,
    user: store.toPublicUser(req.user),
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Central error handler. Without this, a thrown error in a route would leak a stack trace
// to the client in some configurations.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`JWT auth server listening on http://localhost:${config.PORT}`);
  });
}

module.exports = app;
