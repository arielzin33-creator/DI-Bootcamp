import { loginSuccess, loginFailure, logout } from './authSlice'

// Simulates a login request (no real backend) using a thunk so the
// authentication flow still goes through an async dispatch, matching how
// a real login call would behave.
export function login(username, password) {
  return async function (dispatch) {
    await new Promise((resolve) => setTimeout(resolve, 400))

    if (!username.trim() || !password.trim()) {
      dispatch(loginFailure('Username and password are required.'))
      return
    }

    dispatch(loginSuccess({ username: username.trim() }))
  }
}

export function logoutUser() {
  return function (dispatch) {
    dispatch(logout())
  }
}
