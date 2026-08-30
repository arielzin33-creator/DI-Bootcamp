import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../features/user/userSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  // getDefaultMiddleware() already includes redux-thunk, which is what
  // powers the fetchUser thunk action creator in userSlice.js.
})
