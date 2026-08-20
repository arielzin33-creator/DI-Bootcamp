import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const STARTING_AGE = 25;
const SIMULATED_DELAY_MS = 600;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * This exercise specifically asks for `createAsyncThunk` rather than a
 * hand-written thunk (the pattern used in several earlier exercises in this
 * series) — `createAsyncThunk` generates the `pending` / `fulfilled` /
 * `rejected` action types for you; you never dispatch them yourself, only
 * handle them in `extraReducers` below.
 *
 * Each payload creator resolves with a signed delta (`+1` / `-1`) rather
 * than the new age directly. Applying `state.age += delta` in the reducer
 * keeps the "what changed" (the thunk's job) separate from "how the total
 * is kept valid — e.g. never negative" (the reducer's job).
 */
export const ageUpAsync = createAsyncThunk('age/ageUpAsync', async () => {
  await delay(SIMULATED_DELAY_MS);
  return 1;
});

export const ageDownAsync = createAsyncThunk('age/ageDownAsync', async () => {
  await delay(SIMULATED_DELAY_MS);
  return -1;
});

const initialState = {
  age: STARTING_AGE,
  loading: false,
  error: null,
};

const ageSlice = createSlice({
  name: 'age',
  initialState,
  reducers: {
    ageReset(state) {
      state.age = STARTING_AGE;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ageUpAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ageUpAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.age = Math.max(0, state.age + action.payload);
      })
      .addCase(ageDownAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ageDownAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.age = Math.max(0, state.age + action.payload);
      })
      // Neither payload creator above can actually throw — each only
      // awaits a timeout and returns a number, no network call or
      // validation that could fail. These `.rejected` cases are here
      // anyway: `createAsyncThunk` always dispatches `pending`, then
      // exactly one of `fulfilled`/`rejected`, and if this ever gained a
      // real API call that *could* reject, omitting this branch would
      // leave `loading` stuck at `true` forever on failure rather than
      // degrading visibly.
      .addCase(ageUpAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Something went wrong.';
      })
      .addCase(ageDownAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Something went wrong.';
      });
  },
});

export const { ageReset } = ageSlice.actions;
export default ageSlice.reducer;
