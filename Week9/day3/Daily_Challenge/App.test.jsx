import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import plannerReducer from '../features/planner/plannerSlice';
import App from '../App';

const marchFifteenth = new Date(2024, 2, 15);
const marchSixteenth = new Date(2024, 2, 16);

const renderApp = (preloadedState) => {
  const store = configureStore({
    reducer: { planner: plannerReducer },
    preloadedState: {
      planner: {
        tasksByDate: {},
        selectedDate: '2024-03-15',
        ...preloadedState,
      },
    },
  });
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
  return store;
};

describe('switching days via the calendar', () => {
  it('shows tasks for the newly selected day and hides the previous day’s tasks', () => {
    renderApp({
      tasksByDate: {
        '2024-03-15': [{ id: 't1', text: 'Task for the 15th' }],
        '2024-03-16': [{ id: 't2', text: 'Task for the 16th' }],
      },
    });

    expect(screen.getByText('Task for the 15th')).toBeInTheDocument();
    expect(screen.queryByText('Task for the 16th')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: marchSixteenth.toDateString() }));

    expect(screen.getByText('Task for the 16th')).toBeInTheDocument();
    expect(screen.queryByText('Task for the 15th')).not.toBeInTheDocument();
  });

  it('shows a task marker under a day that has tasks', () => {
    renderApp({
      tasksByDate: { '2024-03-16': [{ id: 't1', text: 'Something' }] },
    });

    const dayButton = screen.getByRole('button', { name: marchSixteenth.toDateString() });
    expect(dayButton.querySelector('.calendar__dot')).toBeInTheDocument();
  });
});

describe('adding a task for the selected day', () => {
  it('adds the task only under the currently selected date', () => {
    const store = renderApp();

    fireEvent.change(screen.getByLabelText('New task text'), {
      target: { value: 'Call the dentist' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Call the dentist')).toBeInTheDocument();
    expect(store.getState().planner.tasksByDate['2024-03-15']).toHaveLength(1);
  });
});

describe('editing a task', () => {
  it('updates the task text in place', () => {
    renderApp({
      tasksByDate: { '2024-03-15': [{ id: 't1', text: 'Original text' }] },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Edit "Original text"'), {
      target: { value: 'Updated text' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Updated text')).toBeInTheDocument();
    expect(screen.queryByText('Original text')).not.toBeInTheDocument();
  });
});

describe('deleting a task', () => {
  it('removes the task from the list', () => {
    const store = renderApp({
      tasksByDate: { '2024-03-15': [{ id: 't1', text: 'Temporary task' }] },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete "Temporary task"' }));

    expect(screen.queryByText('Temporary task')).not.toBeInTheDocument();
    expect(store.getState().planner.tasksByDate['2024-03-15']).toHaveLength(0);
  });
});

describe('overall functionality', () => {
  it('add, edit, delete, and day-switching all compose correctly', () => {
    const store = renderApp({
      tasksByDate: { '2024-03-15': [{ id: 't1', text: 'Day 15 task' }] },
    });

    // Add a second task to the 15th.
    fireEvent.change(screen.getByLabelText('New task text'), { target: { value: 'Another task' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(store.getState().planner.tasksByDate['2024-03-15']).toHaveLength(2);

    // Switch to the 16th — the 15th's tasks shouldn't show here.
    fireEvent.click(screen.getByRole('button', { name: marchSixteenth.toDateString() }));
    expect(screen.queryByText('Day 15 task')).not.toBeInTheDocument();

    // Add a task to the 16th.
    fireEvent.change(screen.getByLabelText('New task text'), { target: { value: 'Day 16 task' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(store.getState().planner.tasksByDate['2024-03-16']).toHaveLength(1);
    expect(store.getState().planner.tasksByDate['2024-03-15']).toHaveLength(2);

    // Back to the 15th — its two tasks are still there, untouched.
    fireEvent.click(screen.getByRole('button', { name: marchFifteenth.toDateString() }));
    expect(screen.getByText('Day 15 task')).toBeInTheDocument();
    expect(screen.getByText('Another task')).toBeInTheDocument();
  });
});
