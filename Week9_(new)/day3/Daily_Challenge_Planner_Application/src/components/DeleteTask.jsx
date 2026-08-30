import { useDispatch, useSelector } from 'react-redux'
import { deleteTask } from '../features/planner/plannerSlice'

function DeleteTask({ id }) {
  const dispatch = useDispatch()
  const selectedDate = useSelector((state) => state.planner.selectedDate)

  return (
    <button
      type="button"
      className="delete-task"
      onClick={() => dispatch(deleteTask({ date: selectedDate, id }))}
    >
      Delete
    </button>
  )
}

export default DeleteTask
