/**
 * Test helper: render a component with a real Redux store and a router around it.
 *
 * A real store rather than a mocked one on purpose -- these tests should exercise the
 * actual reducers, since that is where the optimistic-update logic lives.
 */
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../features/auth/authSlice";
import commentsReducer from "../features/comments/commentsSlice";
import profileReducer from "../features/profile/profileSlice";
import realtimeReducer from "../features/realtime/realtimeSlice";
import storiesReducer from "../features/stories/storiesSlice";
import themeReducer from "../features/theme/themeSlice";
import versionsReducer from "../features/versions/versionsSlice";

/**
 * combineReducers rather than passing the map straight to configureStore: it gives
 * `preloadedState` a properly inferred partial type, instead of the `as never` cast
 * that silently defeats type checking on the store's shape.
 */
const rootReducer = combineReducers({
  auth: authReducer,
  stories: storiesReducer,
  comments: commentsReducer,
  versions: versionsReducer,
  profile: profileReducer,
  realtime: realtimeReducer,
  theme: themeReducer,
});

/** The store's shape. Exported so tests can type their preloaded-state factories. */
export type TestState = ReturnType<typeof rootReducer>;

/**
 * Tests supply only the slices they care about; RTK fills in the rest from each
 * reducer's initial state. Typing it this way means a typo in a slice name is a
 * compile error rather than silently ignored preloaded state.
 */
export function makeStore(preloadedState?: Partial<TestState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export type TestStore = ReturnType<typeof makeStore>;

export function renderWithStore(
  ui: ReactElement,
  { store = makeStore(), route = "/" }: { store?: TestStore; route?: string } = {},
) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>,
    ),
  };
}
