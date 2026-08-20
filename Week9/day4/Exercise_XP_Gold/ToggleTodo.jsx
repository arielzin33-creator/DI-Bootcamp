import { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toggleTodo } from '../features/todos/todosSlice';

/**
 * One instance per row, `memo`-wrapped so a re-render of `TodoList` (say,
 * from a fetch resolving) doesn't force every row's checkbox to re-render —
 * only the row whose own `todo` prop changed. `useDispatch`'s returned
 * `dispatch` function is itself reference-stable across renders, so the
 * `useCallback` below is really about giving this component one stable
 * function to hand to `onClick` rather than allocating a new arrow function
 * every render — a small thing on its own, but the same discipline applied
 * consistently is what makes `memo` worth doing anywhere in this app.
 */
function ToggleTodo({ todo }) {
  const dispatch = useDispatch();

  const handleToggle = useCallback(() => dispatch(toggleTodo(todo.id)), [dispatch, todo.id]);

  return (
    <button
      type="button"
      className="stamp"
      role="checkbox"
      aria-checked={todo.completed}
      aria-label={todo.completed ? 'Mark as not done' : 'Mark as done'}
      onClick={handleToggle}
    >
      {todo.completed && <span className="stamp__check" aria-hidden="true" />}
    </button>
  );
}

export default memo(ToggleTodo);
