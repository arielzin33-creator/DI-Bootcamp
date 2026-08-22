import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  age: 25,
  loading: false,
}

// Simulates a network/processing delay before resolving with the new age,
// so the UI can show a loading state while the "request" is in flight.
export const ageUpAsync = createAsyncThunk('age/ageUpAsync', async (_, { getState }) => {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return getState().age.age + 1
})

export const ageDownAsync = createAsyncThunk('age/ageDownAsync', async (_, { getState }) => {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return Math.max(0, getState().age.age - 1)
})

const ageSlice = createSlice({
  name: 'age',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload
    },
    setAge(state, action) {
      state.age = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ageUpAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(ageUpAsync.fulfilled, (state, action) => {
        state.age = action.payload
        state.loading = false
      })
      .addCase(ageUpAsync.rejected, (state) => {
        state.loading = false
      })
      .addCase(ageDownAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(ageDownAsync.fulfilled, (state, action) => {
        state.age = action.payload
        state.loading = false
      })
      .addCase(ageDownAsync.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { setLoading, setAge } = ageSlice.actions
export default ageSlice.reducer
