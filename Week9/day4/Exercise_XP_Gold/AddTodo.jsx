import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTodo } from '../features/todos/todosSlice';

export default function AddTodo() {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmed = title.trim();
      if (!trimmed) return;
      dispatch(addTodo(trimmed));
      setTitle('');
    },
    [dispatch, title],
  );

  return (
    <form className="add-line" onSubmit={handleSubmit}>
      <span className="add-line__marker" aria-hidden="true">
        +
      </span>
      <input
        className="add-line__input"
        placeholder="Add a line item…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit" className="add-line__submit">
        Add
      </button>
    </form>
  );
}
