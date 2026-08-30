// src/components/TaskList.js
//
// Derives the visible subset of tasks from state.filter on every render
// (conditional rendering based on the selected filter), rather than
// storing a separate "filteredTasks" array in state.

import React from 'react';
import { useTasks } from '../context/TaskContext';
import { FILTERS } from '../reducer/taskReducer';
import TaskItem from './TaskItem';

function TaskList() {
  const { tasks, filter } = useTasks();

  const visibleTasks = tasks.filter((task) => {
    if (filter === FILTERS.ACTIVE) return !task.completed;
    if (filter === FILTERS.COMPLETED) return task.completed;
    return true; // FILTERS.ALL
  });

  if (visibleTasks.length === 0) {
    return <p className="empty-message">No tasks to show.</p>;
  }

  return (
    <ul className="task-list">
      {visibleTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}

export default TaskList;
