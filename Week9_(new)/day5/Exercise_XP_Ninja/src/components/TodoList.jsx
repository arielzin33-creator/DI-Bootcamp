import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTodo, removeTodo, setFilter } from '../features/todos/todosSlice'
import { selectTodos, selectVisibilityFilter, selectFilteredTodosCount } from '../features/todos/selectors'
import TodoItem from './TodoItem'

const FILTERS = ['All', 'Active', 'Completed']

function TodoList() {
  const dispatch = useDispatch()
  const todos = useSelector(selectTodos)
  const filter = useSelector(selectVisibilityFilter)
  const filteredCount = useSelector(selectFilteredTodosCount)

  // Single stable handlers shared by every TodoItem: each reads the
  // relevant todo's id off the DOM event instead of being re-created per
  // item, so TodoItem's memo() can actually bail out re-renders.
  const handleToggle = useCallback(
    (event) => {
      dispatch(toggleTodo(event.currentTarget.dataset.id))
    },
    [dispatch]
  )

  const handleDelete = useCallback(
    (event) => {
      dispatch(removeTodo(event.currentTarget.dataset.id))
    },
    [dispatch]
  )

  return (
    <div className="todo-list-container">
      <div className="filter-tabs">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            className={option === filter ? 'active' : ''}
            onClick={() => dispatch(setFilter(option))}
          >
            {option}
          </button>
        ))}
      </div>

      <p className="filtered-count">
        {filteredCount} {filteredCount === 1 ? 'todo' : 'todos'} ({filter})
      </p>

      {todos.length === 0 ? (
        <p className="empty-message">No todos to show.</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default TodoList
