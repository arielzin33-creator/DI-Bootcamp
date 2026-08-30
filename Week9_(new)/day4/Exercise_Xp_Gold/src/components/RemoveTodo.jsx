import { useDispatch } from 'react-redux'
import { removeTodo } from '../features/todos/todosSlice'

function RemoveTodo({ id }) {
  const dispatch = useDispatch()

  return (
    <button type="button" className="remove-todo" onClick={() => dispatch(removeTodo(id))}>
      Remove
    </button>
  )
}

export default RemoveTodo
