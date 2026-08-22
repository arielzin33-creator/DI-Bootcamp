import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addTask } from '../features/planner/plannerSlice'

function AddTask() {
  const dispatch = useDispatch()
  const selectedDate = useSelector((state) => state.planner.selectedDate)
  const [text, setText] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    dispatch(addTask(selectedDate, trimmed))
    setText('')
  }

  return (
    <form className="add-task" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Add a task for this day…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  )
}

export default AddTask
