import { describe, it, expect } from 'vitest';
import userReducer, {
  userFetchStarted,
  userFetchSucceeded,
  userFetchFailed,
  userCleared,
} from './userSlice';

const initialState = { data: null, status: 'idle', error: null };

describe('userSlice reducer', () => {
  it('returns the initial state', () => {
    expect(userReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('userFetchStarted sets status to loading and clears any prior error', () => {
    const withError = { data: null, status: 'failed', error: 'boom' };
    expect(userReducer(withError, userFetchStarted())).toEqual({
      data: null,
      status: 'loading',
      error: null,
    });
  });

  it('userFetchSucceeded stores the payload and clears any prior error', () => {
    const loading = { data: null, status: 'loading', error: null };
    const user = { id: 1, name: 'Leanne Graham' };
    expect(userReducer(loading, userFetchSucceeded(user))).toEqual({
      data: user,
      status: 'succeeded',
      error: null,
    });
  });

  it('userFetchFailed records the error message and leaves any stale data untouched', () => {
    // Retrying after a previous success and then a failure should not wipe
    // out the last known-good data — only `status` and `error` change.
    const succeeded = { data: { id: 1, name: 'Leanne Graham' }, status: 'succeeded', error: null };
    expect(userReducer(succeeded, userFetchFailed('Request failed with status 500.'))).toEqual({
      data: { id: 1, name: 'Leanne Graham' },
      status: 'failed',
      error: 'Request failed with status 500.',
    });
  });

  it('userCleared resets to the initial state', () => {
    const succeeded = { data: { id: 1, name: 'Leanne Graham' }, status: 'succeeded', error: null };
    expect(userReducer(succeeded, userCleared())).toEqual(initialState);
  });
});
