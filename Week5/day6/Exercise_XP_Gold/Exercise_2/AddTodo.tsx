// src/AddTodo.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTodo } from './features/todoSlice';

const AddTodo: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(''); // empty string = no date selected
  const dispatch = useDispatch();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    dispatch(
      addTodo({
        title: trimmedTitle,
        dueDate: dueDate === '' ? null : dueDate
      })
    );

    setTitle('');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ textAlign: 'center', marginTop: '30px' }}>
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add a new todo..."
        style={{ padding: '8px', width: '220px' }}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
        style={{ padding: '8px', marginLeft: '8px' }}
      />
      <button type="submit" style={{ padding: '8px 16px', marginLeft: '8px' }}>
        Add
      </button>
    </form>
  );
};

export default AddTodo;