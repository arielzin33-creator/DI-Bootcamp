// Exercise: "Add rate limiting to protect against brute force attacks on login and
// refresh endpoints."

const rateLimit = require('express-rate-limit');

// Tight limit on credential-guessing endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.AUTH_RATE_LIMIT || 10),
  standardHeaders: true,
  legacyHeaders: false,
  // Only failed attempts count toward the limit, so a legitimate user with a working
  // password isn't locked out by their own normal usage.
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many attempts from this IP. Please try again in 15 minutes.',
    code: 'RATE_LIMITED',
  },
});

// Looser limit for everything else, as a general abuse backstop.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.GENERAL_RATE_LIMIT || 200),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' },
});

module.exports = { authLimiter, generalLimiter };
