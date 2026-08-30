// src/context/TaskContext.js
//
// useContext + useReducer are combined here: the reducer owns state
// transitions, and the context makes {tasks, filter, dispatch} available
// to any descendant component without prop drilling.

import React, { createContext, useContext, useReducer } from 'react';
import { taskReducer, initialState } from '../reducer/taskReducer';

const TaskContext = createContext(undefined);

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const value = {
    tasks: state.tasks,
    filter: state.filter,
    dispatch,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// Custom hook wrapper: components call useTasks() instead of
// useContext(TaskContext) directly, and get a clear error if the
// provider is missing (e.g. a component rendered outside <TaskProvider>).
export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
