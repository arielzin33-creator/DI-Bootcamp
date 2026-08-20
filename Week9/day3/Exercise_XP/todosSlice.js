import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  items: [
    { id: 'todo-1', text: 'Learn Redux Toolkit', completed: true },
    { id: 'todo-2', text: 'Build a todo list', completed: false },
  ],
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      // ID generation is a side effect (randomness) and doesn't belong in
      // the reducer body, which has to stay a pure function of its inputs.
      // `prepare` is where that side effect happens instead.
      prepare(text) {
        return { payload: { id: nanoid(), text, completed: false } };
      },
    },
    toggleTodo(state, action) {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },
    removeTodo(state, action) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addTodo, toggleTodo, removeTodo } = todosSlice.actions;
export default todosSlice.reducer;
