import { createSlice } from '@reduxjs/toolkit'

// Fake "database" of credentials, since there's no real backend here.
const FAKE_USERS = [{ username: 'demo', password: 'password123' }]

const initialState = {
  isAuthenticated: false,
  user: null,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginUser(state, action) {
      const { username, password } = action.payload
      const match = FAKE_USERS.find(
        (u) => u.username === username && u.password === password
      )

      if (match) {
        state.isAuthenticated = true
        state.user = { username: match.username, displayName: match.username }
        state.error = null
      } else {
        state.error = 'Invalid username or password.'
      }
    },
    logoutUser(state) {
      state.isAuthenticated = false
      state.user = null
      state.error = null
    },
    setUser(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
})

export const { loginUser, logoutUser, setUser } = authSlice.actions
export default authSlice.reducer
