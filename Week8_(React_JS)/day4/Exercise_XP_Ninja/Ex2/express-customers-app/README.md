# React & Express — Customers

Two folders — `server/` (Express) and `client/` (React + Vite) — plus
a root `package.json` that can run both together via `concurrently`.

## Quick start (runs both)
```
npm install
npm run dev
```
This installs `concurrently` at the root and starts the Express
server (port 3001) and the Vite dev server together. Open the URL
Vite prints (usually http://localhost:5173).

## Running them separately
```
cd server && npm install && npm start
```
```
cd client && npm install && npm run dev
```

## Verifying the backend on its own
http://localhost:3001/api/customers/ should return:
```
[{"id":1,"firstName":"John","lastName":"Doe"},
{"id":2,"firstName":"Jane","lastName":"Doe"},
{"id":3,"firstName":"Ziv","lastName":"Chen"},
{"id":4,"firstName":"Isaac","lastName":"Groisman"},
{"id":5,"firstName":"Avner","lastName":"Maman"},
{"id":6,"firstName":"Megan","lastName":"Dreyfuss"}]
```
I ran the server directly and confirmed this byte-for-byte, and
separately ran server + client together and curled through the Vite
proxy to confirm the full request path works, not just that the code
compiles.

## Files

**server/server.js** — a plain Express app (not express-generator this
time, per the exercise's own `server.js` instruction), with the
`customers` array hardcoded and a `GET /api/customers/` route
returning it.

**client/src/components/Customers.jsx** — class component,
`state = { customers: [] }`, fetches `/api/customers/` in
`componentDidMount`, renders each customer's first + last name in a
row with a dashed bottom border, centered.

**client/src/App.jsx** — the dark header banner with a small hand-
drawn atom icon and "React & Express" title, then `<Customers />`
below on a white background. The icon is an original SVG (three
rotated ellipses + a center dot) rather than a reproduction of any
specific framework's actual logo artwork.

## About the proxy
Same note as the previous exercise: this uses Vite's `server.proxy`
option (in `client/vite.config.js`) as the equivalent of Create React
App's `package.json` `"proxy"` key, forwarding `/api/*` requests to
the Express server on port 3001.

## Note on file naming
`App.jsx` / `Customers.jsx` rather than `.js`, since Vite requires the
`.jsx` extension to parse JSX. Rename to `.js` with no code changes
if using `create-react-app`, and the exercise's exact `customers.js`
filename will then work as literally specified.
