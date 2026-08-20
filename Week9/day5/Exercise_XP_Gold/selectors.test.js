import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import shopReducer, {
  itemAddedToCart,
  itemQuantityIncremented,
  itemQuantityDecremented,
  itemRemovedFromCart,
  cartCleared,
} from './shopSlice';
import {
  selectProducts,
  selectCartItems,
  selectCartDetails,
  calculateTotalPrice,
  selectCartItemCount,
  makeSelectQuantityInCart,
  selectQuantityInCart,
} from './selectors';

const makeStore = () => configureStore({ reducer: { shop: shopReducer } });

describe('selectProducts', () => {
  it('returns the seeded catalogue', () => {
    const state = makeStore().getState();
    expect(selectProducts(state)).toHaveLength(8);
  });
});

describe('selectCartItems', () => {
  it('is empty on a fresh store', () => {
    expect(selectCartItems(makeStore().getState())).toEqual([]);
  });

  it('gains a line the first time a product is added', () => {
    const store = makeStore();
    store.dispatch(itemAddedToCart('p1'));
    expect(selectCartItems(store.getState())).toEqual([{ productId: 'p1', quantity: 1 }]);
  });

  it('increments the existing line on a repeat add, rather than duplicating it', () => {
    const store = makeStore();
    store.dispatch(itemAddedToCart('p1'));
    store.dispatch(itemAddedToCart('p1'));
    expect(selectCartItems(store.getState())).toEqual([{ productId: 'p1', quantity: 2 }]);
  });
});

describe('selectCartDetails', () => {
  it('joins each cart line with its product name, price, and subtotal', () => {
    const store = makeStore();
    store.dispatch(itemAddedToCart('p1')); // 3.50
    store.dispatch(itemAddedToCart('p1'));
    store.dispatch(itemAddedToCart('p4')); // 1.10

    const details = selectCartDetails(store.getState());
    expect(details).toEqual([
      {
        productId: 'p1',
        name: 'Brass paper clips',
        unit: 'box of 100',
        quantity: 2,
        price: 3.5,
        subtotal: 7.0,
      },
      {
        productId: 'p4',
        name: "Carpenter's pencil",
        unit: 'each',
        quantity: 1,
        price: 1.1,
        subtotal: 1.1,
      },
    ]);
  });
});

describe('calculateTotalPrice', () => {
  it('is zero for an empty cart', () => {
    expect(calculateTotalPrice(makeStore().getState())).toBe(0);
  });

  it('sums subtotals across every line', () => {
    const store = makeStore();
    store.dispatch(itemAddedToCart('p1')); // 3.50
    store.dispatch(itemAddedToCart('p4')); // 1.10
    store.dispatch(itemAddedToCart('p4')); // + 1.10 = 2.20
    expect(calculateTotalPrice(store.getState())).toBe(5.7);
  });

  it('avoids floating-point drift on repeated fractional-cent additions', () => {
    // Verified directly in Node: `1.10 + 1.10 + 1.10 === 3.3` is `false` —
    // the raw sum lands on 3.3000000000000003. This is the case the
    // rounding step in `calculateTotalPrice` exists to correct; it is not
    // a hypothetical, it reproduces with this exact catalogue price.
    const rawSum = 1.1 + 1.1 + 1.1;
    expect(rawSum === 3.3).toBe(false);

    const store = makeStore();
    for (let i = 0; i < 3; i += 1) store.dispatch(itemAddedToCart('p4'));
    expect(calculateTotalPrice(store.getState())).toBe(3.3);
  });
});

describe('selectCartItemCount', () => {
  it('sums quantities, not the number of distinct lines', () => {
    const store = makeStore();
    store.dispatch(itemAddedToCart('p1'));
    store.dispatch(itemAddedToCart('p1'));
    store.dispatch(itemAddedToCart('p2'));
    expect(selectCartItemCount(store.getState())).toBe(3);
  });
});

describe('quantity-in-cart selectors', () => {
  it('returns 0 for a product never added', () => {
    const state = makeStore().getState();
    expect(selectQuantityInCart(state, 'p5')).toBe(0);
  });

  it('tracks one product independently of another via a per-instance cache', () => {
    const selectQtyP1 = makeSelectQuantityInCart();
    const store = makeStore();

    store.dispatch(itemAddedToCart('p1'));
    store.dispatch(itemAddedToCart('p2'));
    store.dispatch(itemAddedToCart('p2'));

    expect(selectQtyP1(store.getState(), 'p1')).toBe(1);
    expect(selectQtyP1(store.getState(), 'p2')).toBe(2);
  });
});

describe('quantity adjustment reducers', () => {
  it('increments an existing line', () => {
    const store = makeStore();
    store.dispatch(itemAddedToCart('p1'));
    store.dispatch(itemQuantityIncremented('p1'));
    expect(selectCartItems(store.getState())).toEqual([{ productId: 'p1', quantity: 2 }]);
  });

  it('removes the line once its quantity is decremented to zero', () => {
    const store = makeStore();
    store.dispatch(itemAddedToCart('p1'));
    store.dispatch(itemQuantityDecremented('p1'));
    expect(selectCartItems(store.getState())).toEqual([]);
  });

  it('removes a line directly regardless of quantity', () => {
    const store = makeStore();
    store.dispatch(itemAddedToCart('p1'));
    store.dispatch(itemAddedToCart('p1'));
    store.dispatch(itemRemovedFromCart('p1'));
    expect(selectCartItems(store.getState())).toEqual([]);
  });

  it('empties the whole cart', () => {
    const store = makeStore();
    store.dispatch(itemAddedToCart('p1'));
    store.dispatch(itemAddedToCart('p2'));
    store.dispatch(cartCleared());
    expect(selectCartItems(store.getState())).toEqual([]);
  });
});
