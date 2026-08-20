import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import { fetchUser } from './thunks';

const makeStore = () => configureStore({ reducer: { user: userReducer } });

const mockUser = { id: 1, name: 'Leanne Graham', email: 'Sincere@april.biz' };

const jsonResponse = (body, ok = true, status = 200) => ({
  ok,
  status,
  json: () => Promise.resolve(body),
});

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchUser thunk', () => {
  it('dispatches userFetchStarted immediately, before the request resolves', async () => {
    let stateDuringRequest;
    global.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          // Peek at store state while the "request" is still in flight.
          stateDuringRequest = store.getState().user;
          resolve(jsonResponse(mockUser));
        }),
    );

    const store = makeStore();
    await store.dispatch(fetchUser(1));

    expect(stateDuringRequest).toEqual({ data: null, status: 'loading', error: null });
  });

  it('dispatches userFetchSucceeded with the response body on a 200', async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse(mockUser));

    const store = makeStore();
    await store.dispatch(fetchUser(1));

    expect(store.getState().user).toEqual({
      data: mockUser,
      status: 'succeeded',
      error: null,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/users/1',
      { signal: undefined },
    );
  });

  it('dispatches userFetchFailed with a readable message on a 404', async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse(null, false, 404));

    const store = makeStore();
    await store.dispatch(fetchUser(999));

    expect(store.getState().user).toEqual({
      data: null,
      status: 'failed',
      error: 'No user exists with id 999.',
    });
  });

  it('dispatches userFetchFailed with a generic message on other error statuses', async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse(null, false, 500));

    const store = makeStore();
    await store.dispatch(fetchUser(1));

    expect(store.getState().user.status).toBe('failed');
    expect(store.getState().user.error).toBe('Request failed with status 500.');
  });

  it('dispatches userFetchFailed when the network request itself rejects', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const store = makeStore();
    await store.dispatch(fetchUser(1));

    expect(store.getState().user).toEqual({
      data: null,
      status: 'failed',
      error: 'Failed to fetch',
    });
  });

  it('does not dispatch a failure when the request is aborted', async () => {
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    global.fetch.mockRejectedValueOnce(abortError);

    const store = makeStore();
    await store.dispatch(fetchUser(1));

    // Still "loading" — an abort is a cancellation, not an outcome, so the
    // thunk deliberately dispatches nothing further.
    expect(store.getState().user.status).toBe('loading');
  });
});
