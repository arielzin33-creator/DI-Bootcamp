// src/features/selectors.ts
import { RootState } from '../store';
import { Todo } from './types';

// Determines whether a todo is overdue: has a due date, is in the past, and isn't completed yet
export function isOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.completed) return false;
  const due = new Date(todo.dueDate);
  const now = new Date();
  return due.getTime() < now.setHours(0, 0, 0, 0); // compare against start of today
}

export function selectFilteredTodos(state: RootState): Todo[] {
  const { todos, filter } = state.todos;

  switch (filter) {
    case 'completed':
      return todos.filter(todo => todo.completed);
    case 'incomplete':
      return todos.filter(todo => !todo.completed);
    case 'overdue':
      return todos.filter(todo => isOverdue(todo));
    case 'all':
    default:
      return todos;
  }
}