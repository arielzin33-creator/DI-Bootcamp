import { describe, it, expect } from 'vitest';
import inventoryReducer, { addProduct, updateQuantity, removeProduct } from './inventorySlice';

const emptyState = { items: [] };

describe('addProduct', () => {
  it('adds a product with a generated id', () => {
    const state = inventoryReducer(emptyState, addProduct('Bubble wrap', 10));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ name: 'Bubble wrap', quantity: 10 });
    expect(typeof state.items[0].id).toBe('string');
  });

  it('defaults quantity to 0 and clamps a negative starting quantity to 0', () => {
    let state = inventoryReducer(emptyState, addProduct('Tape'));
    expect(state.items[0].quantity).toBe(0);

    state = inventoryReducer(emptyState, addProduct('Tape', -5));
    expect(state.items[0].quantity).toBe(0);
  });
});

describe('updateQuantity', () => {
  it('sets the exact quantity for the matching product only', () => {
    let state = inventoryReducer(emptyState, addProduct('A', 5));
    state = inventoryReducer(state, addProduct('B', 5));
    const idA = state.items[0].id;

    state = inventoryReducer(state, updateQuantity({ id: idA, quantity: 12 }));
    expect(state.items[0].quantity).toBe(12);
    expect(state.items[1].quantity).toBe(5);
  });

  it('clamps to a minimum of 0 rather than allowing a negative quantity', () => {
    let state = inventoryReducer(emptyState, addProduct('A', 5));
    const id = state.items[0].id;
    state = inventoryReducer(state, updateQuantity({ id, quantity: -3 }));
    expect(state.items[0].quantity).toBe(0);
  });
});

describe('removeProduct', () => {
  it('removes only the matching product', () => {
    let state = inventoryReducer(emptyState, addProduct('A', 1));
    state = inventoryReducer(state, addProduct('B', 1));
    const idA = state.items[0].id;

    state = inventoryReducer(state, removeProduct(idA));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe('B');
  });
});
