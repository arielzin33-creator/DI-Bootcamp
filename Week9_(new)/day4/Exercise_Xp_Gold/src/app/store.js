import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../features/todos/todosSlice'

export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
  // getDefaultMiddleware() already includes redux-thunk, which powers the
  // fetchTodos thunk action creator in todosSlice.js.
})
