import { configureStore } from '@reduxjs/toolkit';
import ageReducer from '../features/age/ageSlice';

// `configureStore`'s default middleware already includes thunk — that's
// what lets `dispatch(ageUpAsync())` work below with no extra setup.
export const store = configureStore({
  reducer: {
    age: ageReducer,
  },
});

export default store;
