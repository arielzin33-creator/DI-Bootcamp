import { configureStore } from '@reduxjs/toolkit'
import ageReducer from '../features/age/ageSlice'

export const store = configureStore({
  reducer: {
    age: ageReducer,
  },
  // getDefaultMiddleware() already includes redux-thunk, which is what
  // powers the ageUpAsync/ageDownAsync createAsyncThunk action creators.
})
