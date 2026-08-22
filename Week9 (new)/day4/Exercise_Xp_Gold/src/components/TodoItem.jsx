import ToggleTodo from './ToggleTodo'
import RemoveTodo from './RemoveTodo'

function TodoItem({ todo }) {
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <label>
        <ToggleTodo id={todo.id} completed={todo.completed} />
        <span>{todo.text}</span>
      </label>
      <RemoveTodo id={todo.id} />
    </li>
  )
}

export default TodoItem
