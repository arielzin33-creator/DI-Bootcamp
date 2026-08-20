# React & Express — post to server

## Quick start (runs both)
```
npm install
npm run dev
```
Opens the Express server on port 5000 and the Vite client (usually
http://localhost:5173).

## Running separately
```
cd server && npm install && npm start
```
```
cd client && npm install && npm run dev
```

## What I verified directly (not just compiled)
- `GET /api/hello` → `{"message":"Hello From Express"}`
- `POST /api/world` with body `{"post":"Hi from client"}` →
  `{"message":"I received your POST request. This is what you sent
  me: Hi from client"}`
- the server logs `{ post: 'Hi from client' }` on that POST — matches
  your nodemon screenshot exactly
- ran server + client together and confirmed both routes work through
  the Vite proxy, not just directly against the Express port

## Files
- `server/server.js` — `express.json()` middleware (required for
  `req.body` to be populated), `GET /api/hello`, `POST /api/world`
  (logs the body, responds with the templated message)
- `client/src/App.jsx` — class component; `async componentDidMount`
  fetches `/api/hello` and shows it as an `<h1>`; a form with a
  "Post to Server:" label, input, and submit button POSTs
  `{ post: <input value> }` to `/api/world` and displays the response
  message below the input

## About the proxy
Same as the earlier Express exercises: Vite's `server.proxy` (in
`client/vite.config.js`) stands in for Create React App's
`package.json` `"proxy"` key.

## Note on file naming
`App.jsx` rather than `App.js`, for the same Vite-vs-CRA reason as
the previous exercises — rename with no code changes if using
`create-react-app`.
