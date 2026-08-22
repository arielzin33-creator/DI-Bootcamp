import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { editTask } from '../features/planner/plannerSlice'

function EditTask({ id, text, onDone }) {
  const dispatch = useDispatch()
  const selectedDate = useSelector((state) => state.planner.selectedDate)
  const [draft, setDraft] = useState(text)

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return

    dispatch(editTask({ date: selectedDate, id, text: trimmed }))
    onDone()
  }

  return (
    <form className="edit-task" onSubmit={handleSubmit}>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus
      />
      <button type="submit">Save</button>
      <button type="button" onClick={onDone}>
        Cancel
      </button>
    </form>
  )
}

export default EditTask
