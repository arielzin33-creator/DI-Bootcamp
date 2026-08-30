import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  items: [
    { id: nanoid(), title: 'Write project proposal', categoryId: 'work', completed: false, progress: 40 },
    { id: nanoid(), title: 'Review pull requests', categoryId: 'work', completed: true, progress: 100 },
    { id: nanoid(), title: 'Grocery shopping', categoryId: 'personal', completed: false, progress: 0 },
    { id: nanoid(), title: 'Read a chapter of Redux docs', categoryId: 'learning', completed: false, progress: 60 },
  ],
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: {
      reducer(state, action) {
        state.items.push(action.payload)
      },
      prepare(title, categoryId) {
        return { payload: { id: nanoid(), title, categoryId, completed: false, progress: 0 } }
      },
    },
    editTask(state, action) {
      const { id, title } = action.payload
      const task = state.items.find((t) => t.id === id)
      if (task) {
        task.title = title
      }
    },
    deleteTask(state, action) {
      state.items = state.items.filter((t) => t.id !== action.payload)
    },
    updateTaskProgress(state, action) {
      const { id, progress } = action.payload
      const task = state.items.find((t) => t.id === id)
      if (task) {
        task.progress = progress
        if (progress >= 100) {
          task.completed = true
        }
      }
    },
    toggleTaskCompletion(state, action) {
      const task = state.items.find((t) => t.id === action.payload)
      if (task) {
        task.completed = !task.completed
        task.progress = task.completed ? 100 : 0
      }
    },
  },
})

export const { addTask, editTask, deleteTask, updateTaskProgress, toggleTaskCompletion } =
  tasksSlice.actions
export default tasksSlice.reducer
