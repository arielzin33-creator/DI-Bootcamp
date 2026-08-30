import { useDispatch, useSelector } from 'react-redux'
import { fetchTodos } from '../features/todos/todosSlice'
import TodoItem from './TodoItem'

function TodoList() {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.todos)

  return (
    <div className="todo-list-container">
      <div className="fetch-todos">
        <button type="button" onClick={() => dispatch(fetchTodos())} disabled={status === 'loading'}>
          {status === 'loading' ? 'Fetching…' : 'Fetch Todos from API'}
        </button>
        {status === 'failed' && <p className="status-message error">Error: {error}</p>}
      </div>

      {items.length === 0 ? (
        <p className="empty-message">No todos yet. Add one above.</p>
      ) : (
        <ul className="todo-list">
          {items.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default TodoList
