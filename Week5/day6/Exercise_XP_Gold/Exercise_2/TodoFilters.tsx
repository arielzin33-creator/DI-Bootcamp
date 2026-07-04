// src/TodoFilters.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { setFilter } from './features/todoSlice';
import { FilterStatus } from './features/types';

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Incomplete', value: 'incomplete' },
  { label: 'Overdue', value: 'overdue' }
];

const TodoFilters: React.FC = () => {
  const currentFilter = useSelector((state: RootState) => state.todos.filter);
  const dispatch = useDispatch();

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {FILTERS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => dispatch(setFilter(value))}
          style={{
            margin: '0 5px',
            padding: '6px 12px',
            fontWeight: currentFilter === value ? 'bold' : 'normal',
            backgroundColor: currentFilter === value ? '#ddd' : '#fff'
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default TodoFilters;