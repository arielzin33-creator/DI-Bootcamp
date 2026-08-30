// End-to-end test suite. Runs against a real HTTP server on an ephemeral port with an
// in-memory database, so it never touches auth.db.

process.env.DB_FILE = ':memory:';
process.env.AUTH_RATE_LIMIT = '100'; // don't let rate limiting fight the test suite

const assert = require('node:assert');
const app = require('./app');

let passed = 0;
let failed = 0;
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL  ${name}\n          ${err.message}`);
    failed++;
    failures.push(name);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

let baseUrl;

// Minimal cookie jar so cookie-based auth can be tested the way a browser would use it.
function parseCookies(res) {
  const jar = {};
  const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const c of raw) {
    const [pair] = c.split(';');
    const idx = pair.indexOf('=');
    jar[pair.slice(0, idx)] = pair.slice(idx + 1);
  }
  return jar;
}

function cookieHeader(jar) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

async function req(method, path, { body, token, cookies } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookies) headers.Cookie = cookieHeader(cookies);

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* some responses have no body */
  }
  return { status: res.status, body: json, cookies: parseCookies(res) };
}

async function main() {
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  console.log(`Testing against ${baseUrl}`);

  // ---------------- Registration validation ----------------
  section('Registration validation');

  await check('rejects a short username', async () => {
    const r = await req('POST', '/auth/register', {
      body: { username: 'ab', email: 'a@b.com', password: 'GoodPass1' },
    });
    assert.strictEqual(r.status, 400);
    assert.ok(r.body.details.some((d) => d.includes('Username must be')));
  });

  await check('rejects a weak password (no uppercase, too short)', async () => {
    const r = await req('POST', '/auth/register', {
      body: { username: 'validuser', email: 'a@b.com', password: 'weak' },
    });
    assert.strictEqual(r.status, 400);
    assert.ok(r.body.details.some((d) => d.includes('at least 8 characters')));
    assert.ok(r.body.details.some((d) => d.includes('uppercase')));
  });

  await check('rejects a malformed email', async () => {
    const r = await req('POST', '/auth/register', {
      body: { username: 'validuser', email: 'not-an-email', password: 'GoodPass1' },
    });
    assert.strictEqual(r.status, 400);
    assert.ok(r.body.details.some((d) => d.includes('valid email')));
  });

  // ---------------- Registration ----------------
  section('Registration');

  let alice;
  await check('registers a valid user and returns 201 + tokens', async () => {
    const r = await req('POST', '/auth/register', {
      body: { username: 'alice', email: 'alice@example.com', password: 'GoodPass1' },
    });
    assert.strictEqual(r.status, 201);
    assert.ok(r.body.accessToken, 'expected an accessToken');
    assert.strictEqual(r.body.user.username, 'alice');
    assert.strictEqual(r.body.user.emailConfirmed, false);
    alice = r.body;
  });

  await check('never leaks the password hash in a response', async () => {
    assert.strictEqual(JSON.stringify(alice).includes('password_hash'), false);
    assert.strictEqual(alice.user.passwordHash, undefined);
  });

  await check('sets httpOnly cookies for both tokens', async () => {
    const r = await req('POST', '/auth/register', {
      body: { username: 'cookieuser', email: 'cookie@example.com', password: 'GoodPass1' },
    });
    assert.ok(r.cookies.access_token, 'expected an access_token cookie');
    assert.ok(r.cookies.refresh_token, 'expected a refresh_token cookie');
  });

  await check('rejects a duplicate username with 409', async () => {
    const r = await req('POST', '/auth/register', {
      body: { username: 'alice', email: 'other@example.com', password: 'GoodPass1' },
    });
    assert.strictEqual(r.status, 409);
  });

  await check('rejects a duplicate email with 409', async () => {
    const r = await req('POST', '/auth/register', {
      body: { username: 'alice2', email: 'alice@example.com', password: 'GoodPass1' },
    });
    assert.strictEqual(r.status, 409);
  });

  // ---------------- Login ----------------
  section('Login');

  let session;
  await check('logs in with correct credentials', async () => {
    const r = await req('POST', '/auth/login', {
      body: { username: 'alice', password: 'GoodPass1' },
    });
    assert.strictEqual(r.status, 200);
    assert.ok(r.body.accessToken);
    assert.ok(r.body.refreshToken);
    session = r;
  });

  await check('rejects a wrong password with 401', async () => {
    const r = await req('POST', '/auth/login', {
      body: { username: 'alice', password: 'WrongPass1' },
    });
    assert.strictEqual(r.status, 401);
  });

  await check('gives an identical error for unknown user (no enumeration)', async () => {
    const wrongPass = await req('POST', '/auth/login', {
      body: { username: 'alice', password: 'WrongPass1' },
    });
    const noUser = await req('POST', '/auth/login', {
      body: { username: 'ghost', password: 'WrongPass1' },
    });
    assert.strictEqual(wrongPass.body.error, noUser.body.error);
  });

  // ---------------- Protected routes ----------------
  section('Protected routes');

  await check('rejects /dashboard with no token (401)', async () => {
    const r = await req('GET', '/dashboard');
    assert.strictEqual(r.status, 401);
  });

  await check('rejects /dashboard with a garbage token (401)', async () => {
    const r = await req('GET', '/dashboard', { token: 'not.a.jwt' });
    assert.strictEqual(r.status, 401);
    assert.strictEqual(r.body.code, 'TOKEN_INVALID');
  });

  await check('allows /dashboard with a Bearer token', async () => {
    const r = await req('GET', '/dashboard', { token: session.body.accessToken });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.user.username, 'alice');
  });

  await check('allows /dashboard with an httpOnly cookie', async () => {
    const r = await req('GET', '/dashboard', { cookies: session.cookies });
    assert.strictEqual(r.status, 200);
  });

  await check('/auth/me confirms the authenticated identity', async () => {
    const r = await req('GET', '/auth/me', { token: session.body.accessToken });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.authenticated, true);
  });

  await check('rejects a refresh token used as an access token', async () => {
    const r = await req('GET', '/dashboard', { token: session.body.refreshToken });
    assert.strictEqual(r.status, 401);
  });

  // ---------------- Profile update ----------------
  section('Profile update');

  await check('updates the profile of an authenticated user', async () => {
    const r = await req('PATCH', '/auth/profile', {
      token: session.body.accessToken,
      body: { displayName: 'Alice A.', bio: 'Backend engineer.' },
    });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.user.displayName, 'Alice A.');
    assert.strictEqual(r.body.user.bio, 'Backend engineer.');
  });

  await check('rejects a profile update with no token', async () => {
    const r = await req('PATCH', '/auth/profile', { body: { displayName: 'Hacker' } });
    assert.strictEqual(r.status, 401);
  });

  await check('rejects an over-long bio', async () => {
    const r = await req('PATCH', '/auth/profile', {
      token: session.body.accessToken,
      body: { bio: 'x'.repeat(301) },
    });
    assert.strictEqual(r.status, 400);
  });

  await check('rejects an empty profile update', async () => {
    const r = await req('PATCH', '/auth/profile', {
      token: session.body.accessToken,
      body: {},
    });
    assert.strictEqual(r.status, 400);
  });

  // ---------------- Email confirmation ----------------
  section('Email confirmation');

  await check('blocks /auth/vip before the email is confirmed (403)', async () => {
    const r = await req('GET', '/auth/vip', { token: session.body.accessToken });
    assert.strictEqual(r.status, 403);
    assert.strictEqual(r.body.code, 'EMAIL_NOT_CONFIRMED');
  });

  await check('confirms the email with a valid token', async () => {
    const r = await req('GET', alice.confirmationUrl);
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.user.emailConfirmed, true);
  });

  await check('allows /auth/vip after confirmation', async () => {
    const r = await req('GET', '/auth/vip', { token: session.body.accessToken });
    assert.strictEqual(r.status, 200);
  });

  await check('rejects a reused confirmation token', async () => {
    const r = await req('GET', alice.confirmationUrl);
    assert.strictEqual(r.status, 400);
  });

  // ---------------- Token refresh + rotation ----------------
  section('Token refresh and rotation');

  let refreshed;
  await check('exchanges a refresh token for new tokens', async () => {
    const r = await req('POST', '/auth/refresh', {
      body: { refreshToken: session.body.refreshToken },
    });
    assert.strictEqual(r.status, 200);
    assert.ok(r.body.accessToken);
    assert.ok(r.body.refreshToken);
    refreshed = r.body;
  });

  await check('issues a genuinely different refresh token (rotation)', async () => {
    assert.notStrictEqual(refreshed.refreshToken, session.body.refreshToken);
  });

  await check('revokes the old refresh token after rotation', async () => {
    const r = await req('POST', '/auth/refresh', {
      body: { refreshToken: session.body.refreshToken },
    });
    assert.strictEqual(r.status, 401);
    assert.strictEqual(r.body.code, 'TOKEN_REVOKED');
  });

  await check('the newly issued access token works', async () => {
    const r = await req('GET', '/dashboard', { token: refreshed.accessToken });
    assert.strictEqual(r.status, 200);
  });

  await check('rejects a garbage refresh token', async () => {
    const r = await req('POST', '/auth/refresh', { body: { refreshToken: 'nope' } });
    assert.strictEqual(r.status, 401);
  });

  await check('rejects an access token presented to /refresh', async () => {
    const r = await req('POST', '/auth/refresh', {
      body: { refreshToken: refreshed.accessToken },
    });
    assert.strictEqual(r.status, 401);
  });

  // ---------------- Logout + revocation ----------------
  section('Logout and revocation');

  await check('logs out successfully', async () => {
    const r = await req('POST', '/auth/logout', {
      body: { refreshToken: refreshed.refreshToken },
    });
    assert.strictEqual(r.status, 200);
  });

  await check('refresh token is dead after logout (the key security property)', async () => {
    const r = await req('POST', '/auth/refresh', {
      body: { refreshToken: refreshed.refreshToken },
    });
    assert.strictEqual(r.status, 401);
    assert.strictEqual(r.body.code, 'TOKEN_REVOKED');
  });

  await check('logout clears both cookies', async () => {
    const r = await req('POST', '/auth/logout', { body: {} });
    assert.strictEqual(r.cookies.access_token, '');
    assert.strictEqual(r.cookies.refresh_token, '');
  });

  // ---------------- Rate limiting ----------------
  section('Rate limiting');

  await check('rate-limits repeated failed logins', async () => {
    process.env.AUTH_RATE_LIMIT = '5';
    // Fresh app instance so the limiter picks up the lower limit.
    delete require.cache[require.resolve('./app')];
    delete require.cache[require.resolve('./middleware/rateLimit')];
    delete require.cache[require.resolve('./routes/authRoutes')];
    const app2 = require('./app');
    const server2 = app2.listen(0);
    await new Promise((r) => server2.once('listening', r));
    const url = `http://127.0.0.1:${server2.address().port}`;

    let sawLimit = false;
    for (let i = 0; i < 12; i++) {
      const res = await fetch(`${url}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'alice', password: 'WrongPass1' }),
      });
      if (res.status === 429) {
        sawLimit = true;
        break;
      }
    }
    server2.close();
    assert.ok(sawLimit, 'expected a 429 after repeated failed logins');
  });

  // ---------------- Summary ----------------
  server.close();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  if (failed) {
    console.log('Failing tests:', failures.join(', '));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Test harness crashed:', err);
  process.exitCode = 1;
});
