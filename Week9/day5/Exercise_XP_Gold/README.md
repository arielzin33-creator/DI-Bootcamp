# Shopping Cart Selector — Redux Toolkit, `createSelector`, `useCallback`

One slice (`shop`) holding a static product catalogue and a cart array, the three required
selectors, and a `ShoppingCart` component that renders both halves.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 15 tests
```

Verified locally with `@reduxjs/toolkit` 2.12.0, `react-redux` 9.3.0, `reselect` 5.2.0,
React 18.3, Vite 5.4.

## File map

```
src/
  app/store.js                     configureStore
  features/shop/shopSlice.js       catalogue seed data, cart reducers
  features/shop/selectors.js       selectProducts, selectCartItems, calculateTotalPrice, ...
  features/shop/selectors.test.js
  components/ShoppingCart.jsx      the required component — products + cart + total
  components/ProductCard.jsx       memoized shelf row
  components/CartLine.jsx          memoized receipt row
```

## How each instruction is satisfied

| # | Requirement | Where |
|---|---|---|
| 1 | Store, reducers, initial state with products + empty cart | `app/store.js`, `shopSlice.js` |
| 2 | Actions to add items, cart state updates | `itemAddedToCart` + supporting reducers in `shopSlice.js` |
| 3 | `selectProducts`, `selectCartItems`, `calculateTotalPrice` | `selectors.js` |
| 4 | `ShoppingCart` component: `useSelector` for items/total, product list with Add buttons, cart + total display, `useCallback` for adding | `components/ShoppingCart.jsx` |

## Decisions worth explaining

**One slice, not two.** The exercise describes a single piece of state — "products and an empty
cart array" — rather than the tasks-exercise's explicit two-domain split. `shopSlice.js` holds
both fields; only `cart` actually has reducers, since the catalogue is fixed reference data
seeded once at startup.

**`calculateTotalPrice` composes `selectCartItems` and `selectProducts` indirectly**, through an
intermediate `selectCartDetails` selector that joins each cart line with its product's name,
price, and a computed subtotal. Building that join once, in one selector, means the component
never re-derives it, and `calculateTotalPrice` becomes a one-line reduction over data that's
already assembled — the same "compose smaller selectors into a larger one" pattern as
`selectVisibleBooks` in the first exercise.

**The floating-point rounding in `calculateTotalPrice` is not decorative.** One catalogue price,
$1.10, was chosen specifically because it reproduces the classic binary floating-point drift:
`1.10 + 1.10 + 1.10 === 3.3` evaluates to `false` in JavaScript — the raw sum lands on
`3.3000000000000003`. The test suite asserts that drift directly (`rawSum === 3.3` is `false`)
before asserting that `calculateTotalPrice` corrects it. Rounding to the nearest cent at the end
of the reduction is a reasonable safeguard for a *display* total; a system handling real money
would go further and store cents as integers throughout rather than rounding a float after the
fact, and the comment in `selectors.js` says so rather than presenting the rounding step as a
complete solution.

**`makeSelectQuantityInCart` is the same factory pattern as the previous two exercises'
`makeSelectTasksByCategory` / `makeSelectCategoryById`, applied a third time** — each `ProductCard`
needs "how many of *this* product are in the cart," and eight cards calling one shared,
one-entry-cache selector with eight different product IDs would thrash it. Each card builds its
own instance via `useMemo(makeSelectQuantityInCart, [])`.

This one also makes a distinction worth stating precisely, since it's easy to blur: adding any
item to the cart changes the `cart` array's reference, so *every* `ProductCard`'s quantity
selector cache-misses and recomputes — that part is unavoidable and cheap (`.find()` over eight
lines, run eight times). But `useSelector` compares the *returned number*, not the selector's
internal cache state, with `===`. Seven of those eight recomputations return the same number
they returned before, so seven cards don't re-render — only the one whose own quantity changed
does. "The selector recomputed" and "the component re-rendered" are different guarantees, and
conflating them is a common source of confusion about what `createSelector` actually buys you.

**Why `useCallback` matters here, concretely.** `ProductCard` and `CartLine` are both `memo`-wrapped.
`ShoppingCart` builds one stable handler per action (`handleAddToCart`, `handleIncrement`, etc.)
with `useCallback`, and passes the same handler to every row rather than building
`() => dispatch(...)` inline inside the `.map()`. Each row still writes its own
`onClick={() => onAdd(product.id)}` internally — but that inline closure is only created when the
row itself renders, and `memo` is what decides whether the row renders at all. Without the
`useCallback` in the parent, every row would receive a new function prop on every `ShoppingCart`
render regardless of `memo`, and the memoisation would do nothing.

## Validating it

15 tests cover: the add-vs-increment behavior of `itemAddedToCart` (repeat adds increment the
existing line rather than duplicating it), the `selectCartDetails` join producing the exact
shape the UI renders, `calculateTotalPrice` under both a normal and a genuinely
floating-point-drifting cart, `selectCartItemCount` summing quantities rather than counting
lines, and `makeSelectQuantityInCart` tracking two products independently through separate
selector instances. In the browser, each `ProductCard` and `CartLine` carries a small `r{n}`
render counter — add one item and watch only that card's counter and the receipt update.

## What's stubbed rather than built out

There's no persistence — refreshing clears the cart, since state lives only in the Redux store.
There's also no stock/inventory check: the "Add" button never disables, so the cart can hold more
units of a product than a real store might have on the shelf. Both are natural next steps if this
were extended past the exercise's scope.
