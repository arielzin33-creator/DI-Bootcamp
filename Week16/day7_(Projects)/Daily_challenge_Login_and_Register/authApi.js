// Thin wrapper around the two auth endpoints. Both return a parsed JSON body even on
// a non-2xx response, since the server sends { error: "..." } bodies for expected
// failures (already registered / not registered) that the forms need to display —
// only network failure or invalid JSON is treated as an exception.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function post(path, body) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // A raw network failure (server not running, offline) throws a browser-internal
    // TypeError whose message ("Failed to fetch") isn't meaningful to an end user.
    return { ok: false, status: 0, data: { error: 'Could not reach the server. Is it running?' } };
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    // Non-JSON body (e.g. a raw 500 HTML page) — treat as a generic failure rather
    // than throwing out of this helper.
    data = { error: `Unexpected response (${response.status}).` };
  }

  return { ok: response.ok, status: response.status, data };
}

export function registerUser({ name, email, password }) {
  return post('/register', { name, email, password });
}

export function loginUser({ email, password }) {
  return post('/login', { email, password });
}
