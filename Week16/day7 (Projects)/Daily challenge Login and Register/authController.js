const bcrypt = require('bcrypt');
const knex = require('../db/knex');

const SALT_ROUNDS = 10;
// Postgres's unique_violation error code — used to catch a race between two
// simultaneous registrations for the same email (both could pass the "does it
// already exist" check before either commits; the DB's UNIQUE constraint is the
// actual source of truth, this just turns that into a clean 400 instead of a 500).
const UNIQUE_VIOLATION = '23505';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register(req, res) {
  const { name, email: rawEmail, password } = req.body || {};
  const email = normalizeEmail(rawEmail);

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    const existing = await knex('login').where({ email }).first();
    if (existing) {
      return res.status(400).json({ error: 'already registered' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    // A transaction, not two independent inserts: without it, a crash between the
    // two writes could leave a "users" row with no matching "login" row (a
    // permanently unloginable account) or vice versa.
    const user = await knex.transaction(async (trx) => {
      const [newUser] = await trx('users')
        .insert({ name: name.trim(), email })
        .returning(['id', 'name', 'email', 'joined']);
      await trx('login').insert({ hash, email });
      return newUser;
    });

    return res.status(201).json({ user });
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      return res.status(400).json({ error: 'already registered' });
    }
    console.error('Register failed:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

async function login(req, res) {
  const { email: rawEmail, password } = req.body || {};
  const email = normalizeEmail(rawEmail);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const loginRow = await knex('login').where({ email }).first();

    // Deliberately identical response whether the email doesn't exist or the
    // password is wrong — matches the brief's single "not registered" message for
    // both cases, and avoids letting a client enumerate which emails are registered.
    if (!loginRow) {
      return res.status(400).json({ error: 'not registered' });
    }

    const passwordMatches = await bcrypt.compare(password, loginRow.hash);
    if (!passwordMatches) {
      return res.status(400).json({ error: 'not registered' });
    }

    const user = await knex('users').where({ email }).first();
    if (!user) {
      // A login row with no matching users row would mean the two tables drifted
      // out of sync — treat it the same as "not registered" rather than crashing.
      return res.status(400).json({ error: 'not registered' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('Login failed:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

module.exports = { register, login };
