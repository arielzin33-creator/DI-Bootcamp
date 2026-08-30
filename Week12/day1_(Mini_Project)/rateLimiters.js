import rateLimit from 'express-rate-limit';

/**
 * Factory functions, not pre-built singleton instances. `express-rate-limit`
 * keeps its request counters in memory per middleware instance; if
 * `routes/auth.js` imported one shared, module-level limiter (the more
 * obvious way to write this), every `createApp()` call — including the one
 * built fresh for each test file — would share the *same* counters. A test
 * checking "logging in twice succeeds" could then fail depending on how
 * many login attempts some unrelated earlier test already made in the same
 * process, for a reason that has nothing to do with what that test is
 * actually checking. Building a fresh limiter per `createApp()` call keeps
 * each app's rate-limit state — like everything else about it — isolated.
 */
export function createLoginRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again later.' },
  });
}

export function createRefreshRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many refresh attempts. Please try again later.' },
  });
}
