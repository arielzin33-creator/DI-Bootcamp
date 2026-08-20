import { describe, it, expect } from 'vitest';
import inventoryReducer, { addProduct, updateQuantity } from './inventorySlice';
import { selectTotalUnits, selectLowStockCount } from './selectors';

const emptyState = { items: [] };

describe('selectTotalUnits', () => {
  it('sums quantities across every product', () => {
    let inventory = inventoryReducer(emptyState, addProduct('A', 10));
    inventory = inventoryReducer(inventory, addProduct('B', 5));
    expect(selectTotalUnits({ inventory })).toBe(15);
  });

  it('is 0 for an empty inventory', () => {
    expect(selectTotalUnits({ inventory: emptyState })).toBe(0);
  });
});

describe('selectLowStockCount', () => {
  it('counts products with 1-5 units, excluding both zero and well-stocked items', () => {
    let inventory = inventoryReducer(emptyState, addProduct('Out', 0));
    inventory = inventoryReducer(inventory, addProduct('Low', 3));
    inventory = inventoryReducer(inventory, addProduct('Plenty', 40));
    expect(selectLowStockCount({ inventory })).toBe(1);
  });

  it('updates after a quantity change crosses the threshold', () => {
    let inventory = inventoryReducer(emptyState, addProduct('Item', 20));
    const id = inventory.items[0].id;
    expect(selectLowStockCount({ inventory })).toBe(0);

    inventory = inventoryReducer(inventory, updateQuantity({ id, quantity: 2 }));
    expect(selectLowStockCount({ inventory })).toBe(1);
  });
});
