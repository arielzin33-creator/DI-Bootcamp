import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import todosReducer from '../features/todos/todosSlice';
import App from '../App';

// Starting from an empty list rather than the seeded demo todos keeps each
// test's expectations about exactly what's on screen unambiguous.
const renderApp = () => {
  const store = configureStore({
    reducer: { todos: todosReducer },
    preloadedState: { todos: { items: [] } },
  });
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
  return store;
};

describe('Todo List app', () => {
  it('adds a new todo through the AddTodo form', () => {
    renderApp();

    fireEvent.change(screen.getByLabelText('New todo text'), {
      target: { value: 'Buy stamps' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Buy stamps')).toBeInTheDocument();
    // The input clears after a successful add.
    expect(screen.getByLabelText('New todo text')).toHaveValue('');
  });

  it('does not add an empty or whitespace-only todo', () => {
    renderApp();

    fireEvent.change(screen.getByLabelText('New todo text'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Nothing on the page yet.')).toBeInTheDocument();
  });

  it('toggles completion status when the checkbox is clicked', () => {
    renderApp();
    fireEvent.change(screen.getByLabelText('New todo text'), {
      target: { value: 'Water the plants' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    const checkbox = screen.getByRole('checkbox', { name: 'Mark as done' });
    fireEvent.click(checkbox);

    expect(screen.getByRole('checkbox', { name: 'Mark as not done' })).toBeInTheDocument();
    expect(screen.getByText('Water the plants')).toHaveClass('todo__text');
    // the parent <li> carries the --done modifier once completed
    expect(screen.getByText('Water the plants').closest('li')).toHaveClass('todo--done');
  });

  it('removes a todo when its remove button is clicked', () => {
    renderApp();
    fireEvent.change(screen.getByLabelText('New todo text'), { target: { value: 'Temporary' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Temporary')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove "Temporary"' }));

    expect(screen.queryByText('Temporary')).not.toBeInTheDocument();
    expect(screen.getByText('Nothing on the page yet.')).toBeInTheDocument();
  });

  it('supports the full add → complete → remove flow across several todos', () => {
    renderApp();
    const addOne = (text) => {
      fireEvent.change(screen.getByLabelText('New todo text'), { target: { value: text } });
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    };

    addOne('Walk the dog');
    addOne('Read a chapter');

    // Both rows start unchecked, so both checkboxes share the same
    // accessible name — `getAllByRole` and taking the first one (in DOM
    // order, matching "Walk the dog" added first) avoids the ambiguous
    // match `getByRole` would throw on here.
    const [firstCheckbox] = screen.getAllByRole('checkbox', { name: 'Mark as done' });
    fireEvent.click(firstCheckbox);

    expect(screen.getByText('Walk the dog').closest('li')).toHaveClass('todo--done');
    expect(screen.getByText('Read a chapter').closest('li')).not.toHaveClass('todo--done');

    fireEvent.click(screen.getByRole('button', { name: 'Remove "Walk the dog"' }));

    expect(screen.queryByText('Walk the dog')).not.toBeInTheDocument();
    expect(screen.getByText('Read a chapter')).toBeInTheDocument();
  });
});
