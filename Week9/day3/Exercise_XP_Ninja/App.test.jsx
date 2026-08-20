import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from '../features/inventory/inventorySlice';
import App from '../App';

const renderApp = (preloadedItems = []) => {
  const store = configureStore({
    reducer: { inventory: inventoryReducer },
    preloadedState: { inventory: { items: preloadedItems } },
  });
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
  return store;
};

describe('adding products', () => {
  it('adds a product with the given name and starting quantity', () => {
    const store = renderApp();

    fireEvent.change(screen.getByLabelText('New product name'), {
      target: { value: 'Shipping labels' },
    });
    fireEvent.change(screen.getByLabelText('Starting quantity'), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to stock' }));

    expect(screen.getByText('Shipping labels')).toBeInTheDocument();
    expect(store.getState().inventory.items).toEqual([
      expect.objectContaining({ name: 'Shipping labels', quantity: 15 }),
    ]);
  });

  it('does not add a product with a blank name', () => {
    const store = renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'Add to stock' }));
    expect(store.getState().inventory.items).toHaveLength(0);
  });
});

describe('updating quantities', () => {
  it('increments via the stepper button', () => {
    const store = renderApp([{ id: 'p1', name: 'Tape', quantity: 5 }]);

    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity of Tape' }));

    expect(store.getState().inventory.items[0].quantity).toBe(6);
    expect(screen.getByLabelText('Quantity for Tape')).toHaveValue(6);
  });

  it('decrements via the stepper button, and disables at 0', () => {
    const store = renderApp([{ id: 'p1', name: 'Tape', quantity: 1 }]);

    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity of Tape' }));
    expect(store.getState().inventory.items[0].quantity).toBe(0);
    expect(screen.getByRole('button', { name: 'Decrease quantity of Tape' })).toBeDisabled();
  });

  it('typing directly into the quantity field updates the store', () => {
    const store = renderApp([{ id: 'p1', name: 'Tape', quantity: 5 }]);

    fireEvent.change(screen.getByLabelText('Quantity for Tape'), { target: { value: '40' } });

    expect(store.getState().inventory.items[0].quantity).toBe(40);
  });
});

describe('removing products', () => {
  it('removes the product from both the store and the screen', () => {
    const store = renderApp([{ id: 'p1', name: 'Tape', quantity: 5 }]);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Tape from inventory' }));

    expect(store.getState().inventory.items).toHaveLength(0);
    expect(screen.queryByText('Tape')).not.toBeInTheDocument();
  });
});

describe('overall functionality', () => {
  it('supports add, then update, then remove across multiple products without cross-talk', () => {
    const store = renderApp([{ id: 'p1', name: 'Boxes', quantity: 10 }]);

    fireEvent.change(screen.getByLabelText('New product name'), {
      target: { value: 'Labels' },
    });
    fireEvent.change(screen.getByLabelText('Starting quantity'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to stock' }));

    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity of Boxes' }));
    expect(store.getState().inventory.items.find((p) => p.name === 'Boxes').quantity).toBe(11);
    expect(store.getState().inventory.items.find((p) => p.name === 'Labels').quantity).toBe(3);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Labels from inventory' }));

    const remaining = store.getState().inventory.items;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe('Boxes');
  });
});
