# Simulated E-commerce Platform — three slices, two thunks, auth-gated cart

Auth, products, and cart as three independent slices; a real thunk fetching products, a
simulated (explicitly fake) thunk for login; and the cross-slice rule that ties them together —
you can't add to cart while logged out.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 36 tests
```

Verified locally with `@reduxjs/toolkit` 2.12.0, `react-redux` 9.3.0, `@testing-library/react`
16.3.2, React 18.3, Vite 5.4.

**Product data is a real network call** to `fakestoreapi.com` — a public mock API built
specifically for practicing e-commerce front ends. Beyond the mocked test suite, I ran the thunk
directly against the live endpoint outside any mock: it returned 8 real products, correctly
narrowed to `{ id, title, price, category, image }`. **Login is not real** — see the warning in
`authThunks.js` and below.

## A correction, made mid-build

The exercise's given folder structure names every component file with a plain `.js` extension
(`ProductListing.js`, `AuthForm.js`, `App.js`). I initially assumed this just needed a Vite
config tweak to let esbuild parse JSX inside `.js` files, wrote one, and it didn't work — the
build failed with "invalid JS syntax, name the file `.jsx`" regardless. Rather than ship that
broken and move on, I dug into the actual installed `@vitejs/plugin-react` source to understand
why, confirmed its default file-matching pattern *already* covers `.js` in isolation — and the
build still failed the same way even so. I said as much explicitly rather than pretending I'd
found the root cause when I hadn't, and asked before proceeding.

The fix that actually works, applied now: the four JSX-containing files (`App`, `ProductListing`,
`ShoppingCart`, `AuthForm`) and the two supporting sub-components I added (`ProductTag`,
`CartLine`) are named `.jsx`, matching the convention from every earlier exercise in this series.
This is a deviation from the exercise's literal file list — flagged here rather than silently
substituted — but it's what actually builds and tests correctly with zero fighting the tool
chain, which matters more than matching a file extension exactly. The slice, thunk, and selector
files keep their `.js` extension as given, since none of them contain JSX and never needed any
special handling in the first place.

## File map

```
src/
  store.js                              (matches the given flat path)
  App.jsx
  features/
    auth/    authSlice.js, authThunks.js, selectors.js, *.test.js
    products/ productSlice.js, productThunks.js, selectors.js, *.test.js
    cart/    cartSlice.js, selectors.js, cartSlice.test.js
  components/
    ProductListing.jsx, ProductTag.jsx        (ProductTag is an added sub-component)
    ShoppingCart.jsx, CartLine.jsx             (CartLine is an added sub-component)
    AuthForm.jsx
    *.test.jsx                                 (React Testing Library)
```

`selectors.js` in each feature folder, and every `.test.js`/`.test.jsx` file, are additions
beyond the exercise's literal skeleton — expected extensions, in the same spirit as every
earlier exercise in this series adding selectors and tests beyond the bare instructions.

## How each instruction is satisfied

| Step | Requirement | Where |
|---|---|---|
| 1 | Store with thunk middleware | `store.js` |
| 2 | Auth / product / cart slices | the three `features/*/*.js` slices |
| 3 | Simulated login/logout | `authThunks.js` (login), `authSlice.js` (`loggedOut`) |
| 4 | Thunk fetching product data | `productThunks.js` |
| 5 | Add/remove/quantity/totals | `cartSlice.js` (add/remove/quantity), `cart/selectors.js` (totals — see below) |
| 6 | `ProductListing`, `ShoppingCart`, `AuthForm` | `components/` |
| 7 | `useSelector` + `useDispatch` wiring | all three components |
| 8 | Browse / cart / auth / overall tests | reducer, thunk, and RTL component tests throughout |

## Decisions worth explaining

**Totals live in a selector, not a reducer, despite Step 2 asking for "reducers for...
calculating totals."** A cart total is fully determined by `items` already in state — it's
`price × quantity`, summed. Storing it as its own field would mean a second copy of information
the array already contains, and every reducer that touches `items` would have to remember to
keep that copy in sync; miss one call site and the displayed total silently drifts from the
truth. `selectCartTotal` can't drift — it's recomputed from the same array every time, so there's
exactly one source of truth. `cartSlice.test.js` has a test that makes this concrete: there's no
`cart.total` field to assert against anywhere, because there isn't one.

**Login is explicitly fake, and says so loudly.** `simulateLogin` checks a single hardcoded
string ('password') shipped in the client bundle, with no hashing, no server, no session token —
anyone can read the "credential" in devtools. The exercise asks to "simulate" authentication, not
build it, and the comment at the top of `authThunks.js` says in plain terms not to adapt this
pattern to anything that needs to actually be secure. A real login sends credentials to a server,
which is the only place they can be checked without exposing them to the client that's asking.

**Adding to cart requires being logged in — a real cross-slice rule, not a decorative one.**
`ProductTag`'s "Add to cart" button reads `selectIsAuthenticated` (from the *auth* slice) to
decide whether to dispatch `itemAddedToCart` (into the *cart* slice); logged out, the button is
disabled and reads "Log in to buy" instead. This is what makes three separate slices feel like
one application rather than three unrelated demos glued into the same store.

**The product thunk narrows the API response before dispatching it**, the same choice made in
the two previous thunk exercises: `{ id, title, price, description, category, image, rating }`
from Fake Store API becomes `{ id, title, price, category, image }` in the thunk, not left for
the reducer or component to work around. `description` and `rating` are dropped because nothing
in this UI uses them — there's no reason to carry data through the store that nothing reads.

## Validating it

**Reducers** (`authSlice.test.js`, `productSlice.test.js`, `cartSlice.test.js` — 18 tests): pure
input/output checks, including the quantity-clamping and quantity-vs-line-count distinctions in
the cart, and that a failed fetch never touches previously-successful data.

**Thunks** (`authThunks.test.js`, `productThunks.test.js` — 7 tests): `authThunks.test.js` uses
`vi.useFakeTimers()` to control the simulated 500ms delay deterministically rather than actually
waiting on it; `productThunks.test.js` mocks `fetch` the same way the previous two exercises did.

**Components** (`AuthForm.test.jsx`, `ProductListing.test.jsx`, `ShoppingCart.test.jsx` — 11
tests, React Testing Library): this exercise's Step 8 explicitly asks to verify UI updates and
"observe changes... in the AuthForm component," which is a request for rendered-component
behavior, not just reducer logic — so this is the first exercise in the series with actual
component tests rather than store-only ones. Covered: `AuthForm` rendering the login form,
succeeding with the demo password, failing with the wrong one, and returning to the login form on
logout (real timers here — the 500ms delay is short enough not to be worth faking, and mixing
fake timers with RTL's polling `findBy*` queries adds complexity for no real benefit at this
scale); `ProductListing` fetching on mount and rendering the mocked API response, and the
Add-to-cart button's disabled/enabled state and dispatch behavior under both auth states;
`ShoppingCart` rendering line items and the total, updating the total after a removal, and
clearing the basket.

**Beyond the suite:** the unmocked run mentioned above confirms the mocked product-thunk tests
aren't just validating my own mock.

## What's stubbed rather than built out

No persistence for any of the three slices — cart, login, and fetched products all reset on
reload. There's no real checkout flow past the totals. And as stated repeatedly above: the login
is a UI simulation with a hardcoded password, not authentication, and must not be treated as a
starting point for anything that needs real security.
