import { loginStarted, loginSucceeded, loginFailed } from './authSlice';

/**
 * ⚠️ THIS IS A UI SIMULATION, NOT AUTHENTICATION.
 *
 * There is no server here, no password hashing, no session or token, and
 * the "credential" it checks is a single hardcoded string shipped in the
 * client bundle — anyone can read it by opening devtools. This exists to
 * demonstrate the *shape* of an async login flow (dispatch → pending state
 * → delay → success/failure) for the exercise, exactly as "simulate
 * authentication" in the instructions asks for. Do not adapt this pattern
 * to anything that needs to actually be secure; a real login flow sends
 * credentials to a server, which is the only place they can be checked
 * without exposing them.
 */
const DEMO_PASSWORD = 'password';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function toDisplayName(username) {
  return username.charAt(0).toUpperCase() + username.slice(1);
}

export function simulateLogin(username, password) {
  return async function simulateLoginThunk(dispatch) {
    dispatch(loginStarted());
    await delay(500); // stands in for real request latency

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      dispatch(loginFailed('Enter a username.'));
      return;
    }
    if (password !== DEMO_PASSWORD) {
      dispatch(loginFailed('Incorrect password. (Hint: it\u2019s "password".)'));
      return;
    }

    dispatch(loginSucceeded({ username: trimmedUsername, name: toDisplayName(trimmedUsername) }));
  };
}
