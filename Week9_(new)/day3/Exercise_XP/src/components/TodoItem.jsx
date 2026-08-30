import { useDispatch } from 'react-redux'
import { toggleTodo, removeTodo } from '../features/todos/todosSlice'

function TodoItem({ todo }) {
  const dispatch = useDispatch()

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => dispatch(toggleTodo(todo.id))}
        />
        <span>{todo.text}</span>
      </label>
      <button type="button" onClick={() => dispatch(removeTodo(todo.id))}>
        Remove
      </button>
    </li>
  )
}

export default TodoItem
