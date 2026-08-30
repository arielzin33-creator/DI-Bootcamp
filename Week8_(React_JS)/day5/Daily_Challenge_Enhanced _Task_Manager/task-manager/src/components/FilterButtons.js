// src/components/FilterButtons.js
//
// Dispatches SET_FILTER. The active filter is read back from context so
// the currently selected button can be highlighted.

import React from 'react';
import { useTasks } from '../context/TaskContext';
import { FILTERS } from '../reducer/taskReducer';

const FILTER_OPTIONS = [
  { key: FILTERS.ALL, label: 'All' },
  { key: FILTERS.ACTIVE, label: 'Active' },
  { key: FILTERS.COMPLETED, label: 'Completed' },
];

function FilterButtons() {
  const { filter, dispatch } = useTasks();

  return (
    <div className="filter-buttons" role="group" aria-label="Filter tasks">
      {FILTER_OPTIONS.map(({ key, label }) => (
        <button
          key={key}
          className={filter === key ? 'filter-active' : ''}
          onClick={() => dispatch({ type: 'SET_FILTER', payload: { filter: key } })}
          aria-pressed={filter === key}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default FilterButtons;
