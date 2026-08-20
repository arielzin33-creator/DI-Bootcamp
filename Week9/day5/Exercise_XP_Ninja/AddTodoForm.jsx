import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { todoAdded, completedTodosCleared } from '../features/todos/todosSlice';
import { selectTodoStats } from '../features/todos/selectors';

export default function AddTodoForm() {
  const dispatch = useDispatch();
  const stats = useSelector(selectTodoStats);
  const [text, setText] = useState('');

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmed = text.trim();
      if (!trimmed) return;
      dispatch(todoAdded(trimmed));
      setText('');
    },
    [dispatch, text],
  );

  const handleClearCompleted = useCallback(() => dispatch(completedTodosCleared()), [dispatch]);

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <input
        className="add-todo__input"
        placeholder="Write something on the board…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="add-todo__submit">
        Add
      </button>
      {stats.completed > 0 && (
        <button type="button" className="add-todo__clear" onClick={handleClearCompleted}>
          Clear {stats.completed} done
        </button>
      )}
    </form>
  );
}
