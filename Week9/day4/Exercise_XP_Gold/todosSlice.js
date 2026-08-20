import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed' — see fetchTodos in thunks.js
  error: null,
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      // Locally-created todos get a `nanoid()` string id. Fetched todos
      // keep the numeric id JSONPlaceholder assigns them (see thunks.js).
      // Those two id spaces can never collide, which is what lets
      // `setTodos` below replace only the fetched todos without touching
      // anything added locally, using nothing more than a string/number
      // type check plus the `source` tag for clarity.
      prepare(title) {
        return { payload: { id: nanoid(), title, completed: false, source: 'local' } };
      },
    },
    removeTodo(state, action) {
      state.items = state.items.filter((todo) => todo.id !== action.payload);
    },
    toggleTodo(state, action) {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },
    /**
     * Stores todos fetched from the API — dispatched by the `fetchTodos`
     * thunk, not called directly by any component.
     *
     * This does *not* simply replace `state.items` with the fetched array.
     * If it did, adding a couple of local todos and then fetching (or
     * re-fetching, e.g. via a "refresh" button) would silently discard
     * them. Instead it replaces only the previously-fetched ("api"-sourced)
     * todos, and leaves anything added locally untouched — the merge a
     * real app almost always actually wants, even though "set" sounds like
     * it should mean "replace everything."
     */
    setTodos(state, action) {
      const localTodos = state.items.filter((todo) => todo.source === 'local');
      const apiTodos = action.payload.map((todo) => ({ ...todo, source: 'api' }));
      state.items = [...localTodos, ...apiTodos];
      state.status = 'succeeded';
      state.error = null;
    },
    todosFetchStarted(state) {
      state.status = 'loading';
      state.error = null;
    },
    todosFetchFailed(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  addTodo,
  removeTodo,
  toggleTodo,
  setTodos,
  todosFetchStarted,
  todosFetchFailed,
} = todosSlice.actions;
export default todosSlice.reducer;
