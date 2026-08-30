import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  data: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

// Thunk action creator: performs the async API call, then Redux Toolkit
// automatically dispatches pending/fulfilled/rejected actions for it.
export const fetchUser = createAsyncThunk('user/fetchUser', async (userId) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export default userSlice.reducer
