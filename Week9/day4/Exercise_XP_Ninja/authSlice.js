import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // { username, name } | null
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Dispatched by `authThunks.simulateLogin` before the simulated delay. */
    loginStarted(state) {
      state.status = 'loading';
      state.error = null;
    },
    /** Dispatched by the thunk once the simulated check "succeeds". */
    loginSucceeded(state, action) {
      state.status = 'succeeded';
      state.user = action.payload;
      state.error = null;
    },
    /** Dispatched by the thunk if the simulated check fails. */
    loginFailed(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
    /**
     * Logout is synchronous — there's no request to simulate for signing
     * out, so this is dispatched directly from `AuthForm`, not via a thunk.
     */
    loggedOut(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { loginStarted, loginSucceeded, loginFailed, loggedOut } = authSlice.actions;
export default authSlice.reducer;
