import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../features/tasks/tasksSlice';
import categoriesReducer from '../features/categories/categoriesSlice';

/**
 * `configureStore` wires up thunk, the immutability/serialisability dev
 * checks, and the DevTools extension automatically — no manual
 * `applyMiddleware` or `composeEnhancers` needed.
 */
export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    categories: categoriesReducer,
  },
});

export default store;
