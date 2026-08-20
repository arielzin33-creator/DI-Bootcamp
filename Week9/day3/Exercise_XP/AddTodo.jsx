import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTodo } from '../features/todos/todosSlice';

export default function AddTodo() {
  const dispatch = useDispatch();
  const [text, setText] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch(addTodo(trimmed));
    setText('');
  };

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <input
        className="add-todo__input"
        placeholder="Write on the next line…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="New todo text"
      />
      <button type="submit" className="add-todo__submit">
        Add
      </button>
    </form>
  );
}
