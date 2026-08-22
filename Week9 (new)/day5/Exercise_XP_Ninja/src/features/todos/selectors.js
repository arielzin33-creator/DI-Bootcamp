import { createSelector } from '@reduxjs/toolkit'

const selectTodosState = (state) => state.todos.items
const selectFilterState = (state) => state.todos.filter

export const selectVisibilityFilter = createSelector(
  [selectFilterState],
  (filter) => filter
)

// Returns the todos visible under the current filter. Memoized on both
// inputs, so it only re-filters when the todo list or the filter itself
// actually changes — not on unrelated re-renders.
export const selectTodos = createSelector(
  [selectTodosState, selectFilterState],
  (todos, filter) => {
    switch (filter) {
      case 'Active':
        return todos.filter((todo) => !todo.completed)
      case 'Completed':
        return todos.filter((todo) => todo.completed)
      default:
        return todos
    }
  }
)

export const selectFilteredTodosCount = createSelector(
  [selectTodos],
  (todos) => todos.length
)
