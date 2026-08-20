import { useDispatch } from 'react-redux';
import { deleteTask } from '../features/planner/plannerSlice';

export default function DeleteTask({ date, taskId, label }) {
  const dispatch = useDispatch();

  return (
    <button
      type="button"
      className="task__delete"
      aria-label={`Delete "${label}"`}
      onClick={() => dispatch(deleteTask({ date, id: taskId }))}
    >
      ×
    </button>
  );
}
