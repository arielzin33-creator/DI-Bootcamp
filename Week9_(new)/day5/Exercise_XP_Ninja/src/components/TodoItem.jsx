import { memo, useRef } from 'react'

// Wrapped in memo() with stable onToggle/onDelete handlers (see TodoList's
// useCallback), so an item only re-renders when its own `todo` prop
// changes — not just because some other todo or the filter changed.
function TodoItem({ todo, onToggle, onDelete }) {
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <label>
        <input type="checkbox" checked={todo.completed} data-id={todo.id} onChange={onToggle} />
        <span>{todo.text}</span>
      </label>
      <span className="render-count">renders: {renderCount.current}</span>
      <button type="button" data-id={todo.id} onClick={onDelete}>
        Delete
      </button>
    </li>
  )
}

export default memo(TodoItem)
