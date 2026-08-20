import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null, // { username, name } | null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * The full login transition: flips `isAuthenticated` on and stores the
     * user record in one step. This is what the `Login` component
     * dispatches on submit.
     */
    loginUser(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    /**
     * Updates fields on the *already logged-in* user without touching
     * `isAuthenticated` — e.g. editing a display name. This is what keeps
     * `setUser` from being a redundant duplicate of `loginUser`: logging in
     * and updating a profile are different operations with different
     * preconditions, even though both end up writing to `state.user`.
     * Dispatching this while logged out would silently do nothing useful
     * (there's no user object to merge into), so the profile-editing UI
     * that calls it is only ever rendered while authenticated.
     */
    setUser(state, action) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
    },
    logoutUser(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { loginUser, setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
