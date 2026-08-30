// src/components/TaskForm.js
//
// Handles creation of new tasks. Uses useState (not useRef) because the
// input needs to be a controlled field that resets after submission;
// useRef is reserved for the edit flow in TaskItem, per the exercise spec.

import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';

function TaskForm() {
  const { dispatch } = useTasks();
  const [text, setText] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!text.trim()) return;

    dispatch({ type: 'ADD_TASK', payload: { text } });
    setText('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Add a new task..."
        aria-label="New task text"
      />
      <button type="submit">Add Task</button>
    </form>
  );
}

export default TaskForm;
