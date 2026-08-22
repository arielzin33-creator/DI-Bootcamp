import { useDispatch } from 'react-redux'
import { toggleTodo } from '../features/todos/todosSlice'

function ToggleTodo({ id, completed }) {
  const dispatch = useDispatch()

  return (
    <input
      type="checkbox"
      checked={completed}
      onChange={() => dispatch(toggleTodo(id))}
      className="toggle-todo"
    />
  )
}

export default ToggleTodo
