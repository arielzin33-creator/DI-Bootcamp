import { configureStore } from '@reduxjs/toolkit';
import booksReducer from '../features/books/booksSlice';

/**
 * `configureStore` already wires up, in development:
 *   - redux-thunk
 *   - the immutability check middleware
 *   - the serialisability check middleware
 *   - the Redux DevTools extension
 *
 * So there is no `applyMiddleware` / `composeEnhancers` boilerplate to write.
 * `getDefaultMiddleware` is only worth touching when something must be added
 * or switched off — the commented block below shows the shape.
 */
export const store = configureStore({
  reducer: {
    books: booksReducer,
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({ serializableCheck: false }).concat(myMiddleware),
});

export default store;
