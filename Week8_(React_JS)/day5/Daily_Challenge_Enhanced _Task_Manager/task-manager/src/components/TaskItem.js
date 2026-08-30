// src/components/TaskItem.js
//
// Renders a single task and implements the edit feature required by the
// exercise. Two hooks are used together here:
//   - useState (isEditing) toggles between "display" and "edit" mode.
//   - useRef (inputRef) points at the edit <input>. The field is
//     uncontrolled: its value is not mirrored into component state on
//     every keystroke. Instead, the current text is read directly off
//     the DOM node (inputRef.current.value) only at the moment the user
//     saves, and that value is dispatched as the EDIT_TASK payload.
//
// This is the pattern the instructions describe as "use a ref to track
// the edited task text before saving."

import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';

function TaskItem({ task }) {
  const { dispatch } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  // Focus the input as soon as edit mode is activated.
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleToggleComplete = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: { id: task.id } });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: { id: task.id } });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const newText = inputRef.current.value;
    if (newText.trim()) {
      dispatch({ type: 'EDIT_TASK', payload: { id: task.id, text: newText } });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <li className={`task-item${task.completed ? ' completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggleComplete}
        aria-label={`Mark "${task.text}" as ${
          task.completed ? 'active' : 'completed'
        }`}
      />

      {isEditing ? (
        <input
          type="text"
          ref={inputRef}
          defaultValue={task.text}
          onKeyDown={handleKeyDown}
          className="edit-input"
          aria-label="Edit task text"
        />
      ) : (
        <span className="task-text" onClick={handleEditClick}>
          {task.text}
        </span>
      )}

      <div className="task-actions">
        {isEditing ? (
          <>
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <button onClick={handleEditClick}>Edit</button>
        )}
        <button onClick={handleDelete}>Delete</button>
      </div>
    </li>
  );
}

export default TaskItem;
