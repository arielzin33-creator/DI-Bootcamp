# readbook — Balink Bookstore Assignment

A React bookstore website: browse stores, browse a store's books, view a
book's details, manage a cart, and place an order. Built for the Balink
"React Exercice" home assignment.

## Pages

- **Home** — grid of stores
- **Store** (`/store/:storeId`) — books available at that store
- **Product details** (`/product/:bookId`) — description, rating, details,
  price, add to cart
- **Cart** (`/cart`) — line items with quantity controls, delete, total
- **Finalize order** (`/checkout`) — client info form
- **Thanks** (`/thanks`) — order confirmation with order id

## Stack

- React (Vite), React Router (`HashRouter` — see note below)
- **styled-components** for all styling (no CSS framework, per the brief)
- **react-icons** for icons
- Plain React state: Context + `useReducer` for the cart, Context for i18n
  and toasts — no extra state-management library needed at this scale
- Axios for API calls

## Running it

```bash
npm install
npm run dev
```

No API key or account needed — see below.

## About the assignment's API

The brief's Hasura backend (`https://logical-calf-89.hasura.app`, both the
REST endpoints **and** the bonus GraphQL endpoint) is currently hibernated —
every route returns Hasura's "project not reachable" error, confirmed via
direct `curl` (500s across the board). Rather than build against a dead
backend, `src/api/apiClient.js` makes the *real* documented REST calls first
and only falls back to local mock data (`src/api/mockData.js`, 3 stores and
9 books matching the mockup) on failure — so the app starts using the real
API automatically the moment the project comes back online, no code changes
needed. The mock `createOrder` still returns a real generated order id, so
the Thanks page's flow is fully exercised either way.

## Bonuses

- ✅ **Dockerized** — see below.
- ✅ **Language module** — English/French toggle in the header, covering
  every page's UI copy (`src/i18n/`). Detects the browser's language on
  first load, then remembers the choice in `localStorage`.
- ⛔ **GraphQL** — not implemented. The brief's GraphQL endpoint is the same
  hibernated Hasura project as the REST one (confirmed dead), and rebuilding
  the entire data layer twice (REST *and* GraphQL, in parallel, per the
  bonus's "all API calls" requirement) wasn't a good use of time against a
  backend that can't be tested either way. The REST integration above is
  real and complete.

## Docker

```bash
docker-compose up --build
```

Builds the app and serves it via nginx at **http://localhost:8080**.
Multi-stage build: Node builds the production bundle, then a plain
`nginx:alpine` serves the static output — no custom nginx config needed,
because `HashRouter` (see below) means every route is a URL fragment nginx
never has to know about.

## Implementation notes

- **`HashRouter`, not `BrowserRouter`**: this is a static bundle with no
  guaranteed server-side rewrite support wherever it ends up deployed (GitHub
  Pages, a plain nginx container, etc.) — a `BrowserRouter` URL like
  `/cart` would 404 on a direct load or refresh. Verified this actually
  matters by loading `/#/cart` directly against the Docker build.
- **Books reference their store by `storeId`** rather than the store page
  filtering by a free-text name — keeps a book's store affiliation
  unambiguous and matches how the "Get book" endpoint (`/books/:bookId`)
  implies books are individually addressable resources.
- **Cart total is computed as `quantity × unit price` per line**, summed.
  (The mockup's own cart-table numbers aren't internally consistent with
  that formula — they look like placeholder values rather than a deliberate
  spec — so the standard, correct e-commerce formula was used instead.)
- **`FinalizeOrderPage`'s empty-cart redirect is captured once via a lazy
  `useState` initializer**, not read live off the cart. `clearCart()` runs
  before the post-order `navigate("/thanks")` call, which — if the guard
  read the cart live — would fire mid-submit and redirect to the now-empty
  cart instead of the Thanks page. This was caught by actually driving the
  full checkout flow in a browser, not just reading the code.
- Cart contents persist to `localStorage`, so a refresh mid-shop doesn't
  lose it.

## Submission

Per the brief, the repo needs to be named `fullName_bookstore` — rename it
when you push, e.g.:

```bash
git remote add origin <your-repo-url>
git push -u origin main
```
