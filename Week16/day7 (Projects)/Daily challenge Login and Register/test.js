// End-to-end test suite: a real HTTP server talking to the real Postgres database
// configured in .env. Run with `npm test` after `psql ... -f db/schema.sql`.
//
// Uses randomly-generated emails per run so re-running the suite never collides with
// leftover rows from a previous run.

const assert = require('node:assert');
const crypto = require('node:crypto');
const app = require('./index');
const knex = require('./db/knex');

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

async function req(method, path, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }
  return { status: res.status, body: json };
}

function randomEmail() {
  return `test-${crypto.randomBytes(6).toString('hex')}@example.com`;
}

async function main() {
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  console.log(`Testing against ${baseUrl}`);

  section('Health check');
  await check('DB is actually connected, not just the server running', async () => {
    const r = await req('GET', '/health');
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.db, 'connected');
  });

  section('Registration validation');

  await check('rejects a missing name', async () => {
    const r = await req('POST', '/register', { email: randomEmail(), password: 'GoodPass1' });
    assert.strictEqual(r.status, 400);
  });

  await check('rejects an invalid email', async () => {
    const r = await req('POST', '/register', {
      name: 'Test',
      email: 'not-an-email',
      password: 'GoodPass1',
    });
    assert.strictEqual(r.status, 400);
  });

  await check('rejects a short password', async () => {
    const r = await req('POST', '/register', {
      name: 'Test',
      email: randomEmail(),
      password: 'short',
    });
    assert.strictEqual(r.status, 400);
  });

  section('Registration');

  const email = randomEmail();
  const password = 'GoodPass1';
  const createdEmails = [email]; // tracked so cleanup at the end catches every row this run creates

  await check('registers a new user and returns 201 with user data', async () => {
    const r = await req('POST', '/register', { name: 'Ada Lovelace', email, password });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.body.user.name, 'Ada Lovelace');
    assert.strictEqual(r.body.user.email, email);
    assert.ok(r.body.user.id);
    assert.ok(r.body.user.joined);
  });

  await check('never leaks the password hash in the response', async () => {
    const secondEmail = randomEmail();
    createdEmails.push(secondEmail);
    const r = await req('POST', '/register', { name: 'X', email: secondEmail, password });
    assert.strictEqual(JSON.stringify(r.body).includes('hash'), false);
  });

  await check('the row actually landed in both tables (users AND login)', async () => {
    const userRow = await knex('users').where({ email }).first();
    const loginRow = await knex('login').where({ email }).first();
    assert.ok(userRow, 'expected a row in users');
    assert.ok(loginRow, 'expected a row in login');
    // The stored value must be a bcrypt hash, never the plaintext password.
    assert.notStrictEqual(loginRow.hash, password);
    assert.ok(loginRow.hash.startsWith('$2'), 'expected a bcrypt hash');
  });

  await check('registering the same email again -> "already registered"', async () => {
    const r = await req('POST', '/register', { name: 'Ada Again', email, password });
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.body.error, 'already registered');
  });

  await check('registering with different casing of the same email also blocked', async () => {
    const r = await req('POST', '/register', {
      name: 'Ada Upper',
      email: email.toUpperCase(),
      password,
    });
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.body.error, 'already registered');
  });

  section('Login');

  await check('logs in with correct credentials', async () => {
    const r = await req('POST', '/login', { email, password });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.user.email, email);
  });

  await check('logs in with a different-case email (case-insensitive lookup)', async () => {
    const r = await req('POST', '/login', { email: email.toUpperCase(), password });
    assert.strictEqual(r.status, 200);
  });

  await check('wrong password -> "not registered"', async () => {
    const r = await req('POST', '/login', { email, password: 'WrongPassword1' });
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.body.error, 'not registered');
  });

  await check('unknown email -> "not registered" (same message, no enumeration)', async () => {
    const r = await req('POST', '/login', { email: randomEmail(), password: 'whatever123' });
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.body.error, 'not registered');
  });

  await check('the "not registered" message is IDENTICAL for both failure cases', async () => {
    const wrongPass = await req('POST', '/login', { email, password: 'WrongPassword1' });
    const unknownEmail = await req('POST', '/login', {
      email: randomEmail(),
      password: 'whatever123',
    });
    assert.strictEqual(wrongPass.body.error, unknownEmail.body.error);
  });

  section('Cleanup');
  await knex('login').whereIn('email', createdEmails).del();
  await knex('users').whereIn('email', createdEmails).del();
  await knex.destroy();
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
