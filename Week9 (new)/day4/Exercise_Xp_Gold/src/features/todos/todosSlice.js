import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  items: [
    { id: nanoid(), text: 'Learn Redux Thunk', completed: false },
  ],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
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
    removeTodo(state, action) {
      state.items = state.items.filter((todo) => todo.id !== action.payload)
    },
    toggleTodo(state, action) {
      const todo = state.items.find((t) => t.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    setTodos(state, action) {
      state.items = action.payload
    },
    setStatus(state, action) {
      state.status = action.payload
    },
    setError(state, action) {
      state.status = 'failed'
      state.error = action.payload
    },
  },
})

export const { addTodo, removeTodo, toggleTodo, setTodos, setStatus, setError } =
  todosSlice.actions
export default todosSlice.reducer

// Thunk action creator: fetches todos from a mock API, then dispatches the
// slice's own actions (setStatus/setTodos/setError) to update the store.
export function fetchTodos() {
  return async function (dispatch) {
    dispatch(setStatus('loading'))

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10')

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()
      const todos = data.map((todo) => ({
        id: String(todo.id),
        text: todo.title,
        completed: todo.completed,
      }))

      dispatch(setTodos(todos))
      dispatch(setStatus('succeeded'))
    } catch (err) {
      dispatch(setError(err.message))
    }
  }
}
