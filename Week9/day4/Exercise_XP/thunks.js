import { userFetchStarted, userFetchSucceeded, userFetchFailed } from './userSlice';

/**
 * JSONPlaceholder ("Fake Online REST API for Testing and Prototyping") — a
 * long-standing public mock API built for exactly this kind of exercise.
 * Verified reachable and returning the expected user shape as of writing
 * this; if it's ever offline or changed, swap the base URL below.
 */
const USER_API_BASE = 'https://jsonplaceholder.typicode.com/users';

/**
 * Hand-written thunk action creator.
 *
 * This is the pattern `createAsyncThunk` exists to save you from writing by
 * hand — it would collapse `userFetchStarted` / `userFetchSucceeded` /
 * `userFetchFailed` into automatic `pending` / `fulfilled` / `rejected`
 * actions. Written out longhand here because the exercise asks for the
 * three pieces explicitly: a thunk that calls the API, and reducers it
 * dispatches into based on the outcome. The manual version is exactly what
 * `createAsyncThunk` does under the hood.
 *
 * A thunk is just a function that returns another function instead of a
 * plain action object; `configureStore` includes the thunk middleware by
 * default (see `app/store.js`), which is what lets `dispatch` accept a
 * function like this one rather than only accepting `{ type, payload }`.
 *
 * @param {number|string} userId
 * @param {{ signal?: AbortSignal }} [options] - forwarded to `fetch` so a
 *   caller (the component, on unmount) can cancel an in-flight request.
 */
export function fetchUser(userId, { signal } = {}) {
  return async function fetchUserThunk(dispatch) {
    dispatch(userFetchStarted());
    try {
      const response = await fetch(`${USER_API_BASE}/${userId}`, { signal });

      if (!response.ok) {
        const message =
          response.status === 404
            ? `No user exists with id ${userId}.`
            : `Request failed with status ${response.status}.`;
        throw new Error(message);
      }

      const data = await response.json();
      dispatch(userFetchSucceeded(data));
    } catch (error) {
      // An aborted request (component unmounted, or a newer request
      // superseded this one) is not a failure worth showing the user —
      // it's an intentional cancellation, so it's swallowed rather than
      // dispatched as an error.
      if (error.name === 'AbortError') return;
      dispatch(userFetchFailed(error.message || 'Something went wrong fetching the user.'));
    }
  };
}
