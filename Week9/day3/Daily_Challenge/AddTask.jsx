import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTask } from '../features/planner/plannerSlice';
import { selectSelectedDate } from '../features/planner/selectors';

export default function AddTask() {
  const dispatch = useDispatch();
  const selectedDate = useSelector(selectSelectedDate);
  const [text, setText] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch(addTask(selectedDate, trimmed));
    setText('');
  };

  return (
    <form className="add-task" onSubmit={handleSubmit}>
      <input
        className="add-task__input"
        placeholder="Add a task for this day…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="New task text"
      />
      <button type="submit" className="add-task__submit">
        Add
      </button>
    </form>
  );
}
