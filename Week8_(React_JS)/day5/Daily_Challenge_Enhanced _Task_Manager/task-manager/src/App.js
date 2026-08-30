// src/App.js
//
// Composition root: wraps the feature components in TaskProvider so
// every descendant can reach {tasks, filter, dispatch} via useTasks().

import React from 'react';
import { TaskProvider } from './context/TaskContext';
import TaskForm from './components/TaskForm';
import FilterButtons from './components/FilterButtons';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  return (
    <TaskProvider>
      <div className="app">
        <h1>Task Manager</h1>
        <TaskForm />
        <FilterButtons />
        <TaskList />
      </div>
    </TaskProvider>
  );
}

export default App;
