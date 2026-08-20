import { memo, useRef } from 'react';

/**
 * Wrapped in `memo`. `onToggle` and `onDelete` arrive from `TodoList` built
 * with `useCallback`, so toggling one todo doesn't re-render every other
 * row — only the row whose own `todo` prop actually changed. The `r{n}`
 * badge makes that observable: check one box and only that row's counter
 * should move.
 */
function TodoItem({ todo, onToggle, onDelete }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <li className={`todo${todo.completed ? ' todo--done' : ''}`}>
      <button
        type="button"
        className="todo__box"
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={todo.completed ? 'Mark as not done' : 'Mark as done'}
        onClick={() => onToggle(todo.id)}
      >
        {todo.completed && <span className="todo__check" aria-hidden="true" />}
      </button>

      <span className="todo__text">{todo.text}</span>

      <span className="todo__renders" title="Times this row has rendered">
        r{renderCount.current}
      </span>

      <button
        type="button"
        className="todo__delete"
        aria-label={`Delete "${todo.text}"`}
        onClick={() => onDelete(todo.id)}
      >
        ×
      </button>
    </li>
  );
}

export default memo(TodoItem);
