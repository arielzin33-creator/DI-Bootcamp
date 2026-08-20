import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import ageReducer, { ageUpAsync, ageDownAsync, ageReset } from './ageSlice';

const makeStore = () => configureStore({ reducer: { age: ageReducer } });

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ageUpAsync / ageDownAsync', () => {
  it('sets loading true immediately, before the simulated delay resolves', async () => {
    const store = makeStore();
    const dispatched = store.dispatch(ageUpAsync());

    expect(store.getState().age.loading).toBe(true);

    await vi.advanceTimersByTimeAsync(600);
    await dispatched;
  });

  it('increments age by 1 and clears loading on success', async () => {
    const store = makeStore();
    const dispatched = store.dispatch(ageUpAsync());
    await vi.advanceTimersByTimeAsync(600);
    await dispatched;

    expect(store.getState().age).toEqual({ age: 26, loading: false, error: null });
  });

  it('decrements age by 1 on success', async () => {
    const store = makeStore();
    const dispatched = store.dispatch(ageDownAsync());
    await vi.advanceTimersByTimeAsync(600);
    await dispatched;

    expect(store.getState().age.age).toBe(24);
  });

  it('clamps age at 0 rather than going negative', async () => {
    const store = configureStore({
      reducer: { age: ageReducer },
      preloadedState: { age: { age: 0, loading: false, error: null } },
    });

    const dispatched = store.dispatch(ageDownAsync());
    await vi.advanceTimersByTimeAsync(600);
    await dispatched;

    expect(store.getState().age.age).toBe(0);
  });

  it('handles two sequential dispatches correctly, each reading the latest state', async () => {
    const store = makeStore();
    const first = store.dispatch(ageUpAsync());
    await vi.advanceTimersByTimeAsync(600);
    await first;

    const second = store.dispatch(ageUpAsync());
    await vi.advanceTimersByTimeAsync(600);
    await second;

    expect(store.getState().age.age).toBe(27);
  });
});

describe('rejected branch (constructed directly)', () => {
  // Neither payload creator can actually throw under normal use (see the
  // comment in ageSlice.js), so there's no way to make `ageUpAsync()`
  // genuinely reject through the store. What's tested here instead is that
  // *if* a rejected action ever arrives, the reducer handles it — by
  // constructing that action directly, the same way `createAsyncThunk`
  // would shape it, rather than exercising it through dispatch.
  it('clears loading and records the error message', () => {
    const loading = { age: 25, loading: true, error: null };
    const rejectedAction = {
      type: ageUpAsync.rejected.type,
      error: { message: 'Network unreachable' },
    };
    const state = ageReducer(loading, rejectedAction);

    expect(state).toEqual({ age: 25, loading: false, error: 'Network unreachable' });
  });
});

describe('ageReset', () => {
  it('returns to the starting age and clears loading/error', () => {
    const messyState = { age: 40, loading: true, error: 'oops' };
    expect(ageReducer(messyState, ageReset())).toEqual({ age: 25, loading: false, error: null });
  });
});
