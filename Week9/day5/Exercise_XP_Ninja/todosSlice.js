import { createSlice, nanoid } from '@reduxjs/toolkit';

/** The three visibility states named explicitly in the exercise. */
export const VISIBILITY_FILTERS = {
  ALL: 'All',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
};

const initialState = {
  items: [
    { id: 'todo-1', text: "Order more chalk before Friday's lesson", completed: false },
    { id: 'todo-2', text: 'Grade yesterday\u2019s pop quizzes', completed: true },
    { id: 'todo-3', text: 'Water the classroom plant', completed: false },
    { id: 'todo-4', text: "Erase last week's homework list", completed: true },
    { id: 'todo-5', text: 'Prep the field trip permission slips', completed: false },
  ],
  visibilityFilter: VISIBILITY_FILTERS.ALL,
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoAdded: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      // ID generation is a side effect and doesn't belong in the reducer body.
      prepare(text) {
        return { payload: { id: nanoid(), text, completed: false } };
      },
    },
    todoToggled(state, action) {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },
    todoRemoved(state, action) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    completedTodosCleared(state) {
      state.items = state.items.filter((t) => !t.completed);
    },
    visibilityFilterChanged(state, action) {
      state.visibilityFilter = action.payload;
    },
  },
});

export const {
  todoAdded,
  todoToggled,
  todoRemoved,
  completedTodosCleared,
  visibilityFilterChanged,
} = todosSlice.actions;
export default todosSlice.reducer;
