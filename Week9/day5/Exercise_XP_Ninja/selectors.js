import { createSelector } from '@reduxjs/toolkit';
import { VISIBILITY_FILTERS } from './todosSlice';

/** Raw, unfiltered todo array. Plain function — no derivation, no memoisation needed. */
export const selectTodoItems = (state) => state.todos.items;

/** The currently active visibility filter: 'All' | 'Active' | 'Completed'. */
export const selectVisibilityFilter = (state) => state.todos.visibilityFilter;

/**
 * Todos narrowed to the current visibility filter.
 *
 * `.filter()` allocates a new array every call, so without memoisation this
 * would return a fresh reference on every dispatched action — including
 * ones that touch neither `items` nor `visibilityFilter` — and defeat
 * react-redux's `===` re-render check. `createSelector` only recomputes
 * when `selectTodoItems` or `selectVisibilityFilter` actually returns
 * something new.
 */
export const selectTodos = createSelector(
  [selectTodoItems, selectVisibilityFilter],
  (items, filter) => {
    switch (filter) {
      case VISIBILITY_FILTERS.ACTIVE:
        return items.filter((todo) => !todo.completed);
      case VISIBILITY_FILTERS.COMPLETED:
        return items.filter((todo) => todo.completed);
      case VISIBILITY_FILTERS.ALL:
      default:
        return items;
    }
  },
);

/**
 * How many todos are showing under the current filter — built on top of
 * `selectTodos` rather than re-filtering, so switching tabs recomputes the
 * count for free as a side effect of computing the list itself.
 */
export const selectFilteredTodosCount = createSelector(
  [selectTodos],
  (todos) => todos.length,
);

/**
 * Total / active / completed, independent of whichever filter is currently
 * selected. This is the classic TodoMVC footer count ("3 items left") —
 * deliberately built on `selectTodoItems`, not `selectTodos`, because it
 * needs to stay meaningful even while looking at the Completed tab, where
 * `selectFilteredTodosCount` would otherwise report the completed count
 * instead of what's left to do.
 */
export const selectTodoStats = createSelector([selectTodoItems], (items) => ({
  total: items.length,
  active: items.filter((todo) => !todo.completed).length,
  completed: items.filter((todo) => todo.completed).length,
}));
