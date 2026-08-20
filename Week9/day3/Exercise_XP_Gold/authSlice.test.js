import { describe, it, expect } from 'vitest';
import authReducer, { loginUser, setUser, logoutUser } from './authSlice';

const initialState = { isAuthenticated: false, user: null };

describe('loginUser', () => {
  it('sets isAuthenticated and stores the user', () => {
    const user = { username: 'ada', name: 'Ada' };
    expect(authReducer(initialState, loginUser(user))).toEqual({
      isAuthenticated: true,
      user,
    });
  });
});

describe('setUser', () => {
  it('merges fields into the existing user without touching isAuthenticated', () => {
    const loggedIn = { isAuthenticated: true, user: { username: 'ada', name: 'Ada' } };
    const state = authReducer(loggedIn, setUser({ name: 'Ada Lovelace' }));
    expect(state).toEqual({
      isAuthenticated: true,
      user: { username: 'ada', name: 'Ada Lovelace' },
    });
  });

  it('is a no-op while logged out — there is no user object to merge into', () => {
    expect(authReducer(initialState, setUser({ name: 'Ada' }))).toEqual(initialState);
  });
});

describe('logoutUser', () => {
  it('clears both isAuthenticated and user', () => {
    const loggedIn = { isAuthenticated: true, user: { username: 'ada', name: 'Ada' } };
    expect(authReducer(loggedIn, logoutUser())).toEqual(initialState);
  });
});
