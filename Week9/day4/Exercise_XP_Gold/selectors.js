import { createSelector } from '@reduxjs/toolkit';

export const selectTodoItems = (state) => state.todos.items;
export const selectTodosStatus = (state) => state.todos.status;
export const selectTodosError = (state) => state.todos.error;

export const selectTodoStats = createSelector([selectTodoItems], (items) => ({
  total: items.length,
  completed: items.filter((todo) => todo.completed).length,
  remaining: items.filter((todo) => !todo.completed).length,
}));
