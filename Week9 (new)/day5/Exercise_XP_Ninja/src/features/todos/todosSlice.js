import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  items: [
    { id: nanoid(), text: 'Learn Redux selectors', completed: true },
    { id: nanoid(), text: 'Build a filtered todo list', completed: false },
    { id: nanoid(), text: 'Optimize with useCallback', completed: false },
  ],
  filter: 'All', // 'All' | 'Active' | 'Completed'
}

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.items.push(action.payload)
      },
      prepare(text) {
        return { payload: { id: nanoid(), text, completed: false } }
      },
    },
    toggleTodo(state, action) {
      const todo = state.items.find((t) => t.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    removeTodo(state, action) {
      state.items = state.items.filter((t) => t.id !== action.payload)
    },
    setFilter(state, action) {
      state.filter = action.payload
    },
  },
})

export const { addTodo, toggleTodo, removeTodo, setFilter } = todosSlice.actions
export default todosSlice.reducer
