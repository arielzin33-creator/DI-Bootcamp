import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  todos: [
    { id: nanoid(), text: 'Learn Redux Toolkit', completed: false },
    { id: nanoid(), text: 'Build a todo list', completed: false },
  ],
}

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.todos.push(action.payload)
      },
      prepare(text) {
        return { payload: { id: nanoid(), text, completed: false } }
      },
    },
    toggleTodo(state, action) {
      const todo = state.todos.find((t) => t.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    removeTodo(state, action) {
      state.todos = state.todos.filter((t) => t.id !== action.payload)
    },
  },
})

export const { addTodo, toggleTodo, removeTodo } = todosSlice.actions
export default todosSlice.reducer
