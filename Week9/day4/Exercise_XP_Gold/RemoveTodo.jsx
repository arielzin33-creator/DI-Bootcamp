import { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { removeTodo } from '../features/todos/todosSlice';

function RemoveTodo({ todoId, label }) {
  const dispatch = useDispatch();

  const handleRemove = useCallback(() => dispatch(removeTodo(todoId)), [dispatch, todoId]);

  return (
    <button type="button" className="tear" aria-label={`Remove "${label}"`} onClick={handleRemove}>
      ×
    </button>
  );
}

export default memo(RemoveTodo);
