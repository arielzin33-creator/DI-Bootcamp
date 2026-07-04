// src/features/types.ts

// Using a string literal union instead of a loose 'string' type keeps filter values type-safe
export type FilterStatus = 'all' | 'completed' | 'incomplete' | 'overdue';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null; // ISO date string (e.g. "2026-07-15"), or null if no due date set
  createdAt: string; // ISO timestamp, useful for sorting/auditing
}

// A Partial<Todo> subset used specifically for the "add" form,
// since id/completed/createdAt are generated internally, not supplied by the user
export type NewTodoInput = Pick<Todo, 'title' | 'dueDate'>;

export interface TodoState {
  todos: Todo[];
  filter: FilterStatus;
}