# Store Inventory Management — React-Redux + Redux Toolkit

One slice, three reducers, four components — `InventoryList` composing per-product
`UpdateQuantity` and `RemoveProduct` controls, `AddProduct` as a standalone form.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 16 tests
```

Verified locally with `@reduxjs/toolkit` 2.12.0, `react-redux` 9.3.0,
`@testing-library/react` 16.3.2, React 18.3, Vite 5.4.

## File map

```
src/
  app/store.js
  features/inventory/inventorySlice.js   addProduct, updateQuantity, removeProduct
  features/inventory/selectors.js
  features/inventory/inventorySlice.test.js
  features/inventory/selectors.test.js
  components/InventoryList.jsx           the required list component
  components/AddProduct.jsx
  components/UpdateQuantity.jsx          one instance per product row
  components/RemoveProduct.jsx           one instance per product row
  components/App.test.jsx                interaction tests, per Step 5
```

## How each instruction is satisfied

| Step | Requirement | Where |
|---|---|---|
| 1 | Slice: `addProduct`, `updateQuantity`, `removeProduct` | `inventorySlice.js` |
| 2 | `configureStore` with the slice | `app/store.js` |
| 3 | `InventoryList`, `AddProduct`, `UpdateQuantity`, `RemoveProduct` | `components/` |
| 4 | `useSelector` + `useDispatch` wiring | all four components |
| 5 | Add / update / remove / overall tests | `inventorySlice.test.js`, `selectors.test.js`, `App.test.jsx` |

## Decisions worth explaining

**`UpdateQuantity` and `RemoveProduct` are per-row components, not standalone global controls** —
the same reading applied to the equivalent components in the earlier todo-with-thunks exercise in
this series: a component that "updates product quantities" or "removes products" is far more
usable rendered once per visible row (with that row's product already in scope) than as a
separate control where you'd have to type or select a product id by hand.

**This is the first "basic" exercise in the series where `createSelector` genuinely earns its
place**, in contrast to the previous two (`basic-todo-list`, `user-auth`), where every selector
stayed a plain function because nothing was actually derived. `selectTotalUnits` sums quantities
across the whole inventory — a real reduction, not a pass-through — so it's wrapped, and
`selectLowStockCount` the same way. `selectProducts` itself stays plain, same reasoning as always:
it returns the array unchanged.

**Quantities clamp at 0** in both `addProduct` (a negative starting quantity is rejected down to
0) and `updateQuantity` (typing or stepping below 0 clamps rather than going negative) — a
negative unit count isn't a meaningful inventory state, so the reducer enforces that rather than
leaving it to whichever component happens to dispatch the action to remember.

**"Low stock" is 1–5 units, deliberately excluding 0.** Zero and low-but-nonzero are different
situations worth flagging differently — `bin-card--out` (red, "Out of stock") versus
`bin-card--low` (yellow hazard stripe, "Low stock") — so `selectLowStockCount` explicitly excludes
zero-quantity products rather than folding "out" into "low."

## Validating it

**Reducers** (`inventorySlice.test.js`, 5 tests): adding generates an id and clamps a negative
starting quantity to 0; updating affects only the matching product and clamps at 0; removing
affects only the matching product.

**Selectors** (`selectors.test.js`, 4 tests): `selectTotalUnits` sums correctly (and is 0 for an
empty inventory); `selectLowStockCount` counts the 1–5 range specifically, excluding both
zero-stock and well-stocked items, and updates correctly after a quantity change crosses the
threshold.

**Component interactions** (`App.test.jsx`, 7 tests): adding a product through the real form
(and rejecting a blank name); incrementing and decrementing via the stepper buttons, including
the decrement button disabling at 0; typing directly into the quantity field; removing a product
from both the store and the screen; and a combined add → update → remove sequence across two
products confirming operating on one doesn't disturb the other.

## What's stubbed rather than built out

There's no persistence between reloads, no search or sort for a longer product list, and no unit
of measure (everything is just a bare count) — reasonable next steps if this needed to look more
like a real stockroom tool rather than the exercise's scope.
