// src/features/todoSlice.ts
import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { Todo, TodoState, FilterStatus, NewTodoInput } from './types';

const STORAGE_KEY = 'redux-todo-app-todos';

// ---------- LocalStorage helpers ----------

function loadTodosFromStorage(): Todo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Todo[]) : [];
  } catch (error) {
    console.error('Failed to load todos from localStorage:', error);
    return [];
  }
}

function saveTodosToStorage(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos to localStorage:', error);
  }
}

// ---------- Initial state ----------

const initialState: TodoState = {
  todos: loadTodosFromStorage(),
  filter: 'all'
};

// ---------- Slice ----------

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      reducer: (state, action: PayloadAction<Todo>) => {
        state.todos.push(action.payload);
        saveTodosToStorage(state.todos);
      },
      prepare: (input: NewTodoInput) => {
        return {
          payload: {
            id: nanoid(),
            title: input.title,
            dueDate: input.dueDate,
            completed: false,
            createdAt: new Date().toISOString()
          } as Todo
        };
      }
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find(t => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
        saveTodosToStorage(state.todos);
      }
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter(t => t.id !== action.payload);
      saveTodosToStorage(state.todos);
    },
    setFilter: (state, action: PayloadAction<FilterStatus>) => {
      state.filter = action.payload;
    }
  }
});

export const { addTodo, toggleTodo, deleteTodo, setFilter } = todoSlice.actions;
export default todoSlice.reducer;