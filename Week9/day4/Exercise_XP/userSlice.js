import { createSlice } from '@reduxjs/toolkit';

/**
 * `data` starts at `null` rather than `{}`. An empty object is
 * indistinguishable from "a user with no fields" in a way `null` isn't —
 * checking `user === null` reads unambiguously as "nothing has loaded yet",
 * whereas checking `Object.keys(user).length === 0` to mean the same thing
 * is easy to get wrong once the shape has any optional fields.
 */
const initialState = {
  data: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /** Dispatched by the thunk before the request goes out. */
    userFetchStarted(state) {
      state.status = 'loading';
      state.error = null;
    },
    /** Dispatched by the thunk when the request resolves successfully. */
    userFetchSucceeded(state, action) {
      state.status = 'succeeded';
      state.data = action.payload;
      state.error = null;
    },
    /** Dispatched by the thunk when the request fails or the response isn't ok. */
    userFetchFailed(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
    userCleared(state) {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { userFetchStarted, userFetchSucceeded, userFetchFailed, userCleared } =
  userSlice.actions;
export default userSlice.reducer;
