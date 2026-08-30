import { createSlice, nanoid } from '@reduxjs/toolkit'
import { todayISO } from '../../utils/date'

const initialState = {
  selectedDate: todayISO(),
  tasksByDay: {
    [todayISO()]: [
      { id: nanoid(), text: 'Plan the week' },
      { id: nanoid(), text: 'Review pull requests' },
    ],
  },
}

const plannerSlice = createSlice({
  name: 'planner',
  initialState,
  reducers: {
    selectDay(state, action) {
      state.selectedDate = action.payload
    },
    addTask: {
      reducer(state, action) {
        const { date, task } = action.payload
        if (!state.tasksByDay[date]) {
          state.tasksByDay[date] = []
        }
        state.tasksByDay[date].push(task)
      },
      prepare(date, text) {
        return { payload: { date, task: { id: nanoid(), text } } }
      },
    },
    editTask(state, action) {
      const { date, id, text } = action.payload
      const dayTasks = state.tasksByDay[date]
      if (!dayTasks) return
      const task = dayTasks.find((t) => t.id === id)
      if (task) {
        task.text = text
      }
    },
    deleteTask(state, action) {
      const { date, id } = action.payload
      const dayTasks = state.tasksByDay[date]
      if (!dayTasks) return
      state.tasksByDay[date] = dayTasks.filter((t) => t.id !== id)
    },
  },
})

export const { selectDay, addTask, editTask, deleteTask } = plannerSlice.actions
export default plannerSlice.reducer
