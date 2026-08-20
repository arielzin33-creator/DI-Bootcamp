# React Router Error Boundary demo

## Setup

```
npm install
npm run dev
```
Build for deployment:
```
npm run build
```

## Files

- `src/ErrorBoundary.jsx` — the class-based error boundary
  (`hasError` state, set in `componentDidCatch`)
- `src/App.jsx` — router, Bootstrap navbar with three `NavLink`s,
  the three screens, and the routes, each wrapped in `ErrorBoundary`

## A note on file naming

The exercise's instructions use `App.js` and reference
`create-react-app`, which uses Babel and parses JSX in a plain `.js`
file without complaint. This project instead uses Vite for a faster
setup, and Vite's default toolchain only parses JSX syntax in files
named `.jsx` (or `.tsx`) — a `.js` file with JSX in it fails to build.

So the component code here is identical to what the exercise asks for,
just saved as `App.jsx` and `ErrorBoundary.jsx` instead of `.js`. If
you're actually running this inside a `create-react-app` project,
you can rename both files back to `.js` with no code changes needed —
that's purely a Vite-vs-CRA tooling difference, not something about
the React code itself.

## What each route does

- `/` → `HomeScreen`, renders a heading, no error
- `/profile` → `ProfileScreen`, renders a heading, no error
- `/shop` → `ShopScreen`, throws an error on render on purpose, caught
  by its `ErrorBoundary` wrapper — the navbar and the rest of the app
  stay usable, only the Shop route's content is replaced by the
  boundary's fallback UI
