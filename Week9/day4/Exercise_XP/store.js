import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';

/**
 * `configureStore` already includes the thunk middleware in its default
 * middleware stack — there's no separate `redux-thunk` package to install
 * or `applyMiddleware(thunk)` call to write. That's what makes `fetchUser`
 * (a function, not a plain action object) a valid thing to pass to
 * `dispatch` anywhere in this app.
 *
 * To confirm: `store.getState` aside, `configureStore` also exposes
 * nothing that names the middleware directly, but you can see it in action
 * simply by dispatching a thunk without any extra setup — if the thunk
 * middleware weren't present, `dispatch(fetchUser(1))` would throw
 * ("Actions must be plain objects").
 */
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(myLoggerMiddleware),
});

export default store;
