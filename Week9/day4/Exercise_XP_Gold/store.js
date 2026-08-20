import { configureStore } from '@reduxjs/toolkit';
import todosReducer from '../features/todos/todosSlice';

// As in the previous exercise: `configureStore`'s default middleware stack
// already includes thunk, so `dispatch(fetchTodos())` works with no
// additional setup — there's no separate `redux-thunk` install step.
export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
});

export default store;
