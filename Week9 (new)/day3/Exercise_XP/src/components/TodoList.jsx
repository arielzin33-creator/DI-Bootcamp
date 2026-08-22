import { useSelector } from 'react-redux'
import TodoItem from './TodoItem'

function TodoList() {
  const todos = useSelector((state) => state.todos.todos)

  if (todos.length === 0) {
    return <p className="empty-message">No todos yet. Add one above.</p>
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}

export default TodoList
