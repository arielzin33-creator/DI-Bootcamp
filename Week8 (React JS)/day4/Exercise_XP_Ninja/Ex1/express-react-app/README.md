# Express + React demo

Two folders: `backend/` (Express) and `frontend/` (React + Vite).

## Run the backend

```
cd backend
npm install
PORT=3001 npm start
```
Confirm it works: open http://localhost:3001/users — you should see
```
[{"id":1,"username":"somebody"},{"id":2,"username":"somebody_else"}]
```

## Run the frontend

In a second terminal:
```
cd frontend
npm install
npm run dev
```
Open the URL Vite prints (usually http://localhost:5173). You should
see a "Users" heading and a two-item list: somebody, somebody_else.

## About the proxy

The exercise's step 8 says to add `"proxy": "http://localhost:3001"`
to `package.json` — that's specifically a Create React App feature.
This project uses Vite instead, whose equivalent lives in
`vite.config.js`:
```js
server: {
  proxy: {
    "/users": "http://localhost:3001",
  },
},
```
Same effect either way: the frontend calls the relative path
`/users`, and the dev server forwards it to the Express backend, so
the browser never makes a genuinely cross-origin request and no CORS
configuration is needed on the Express side.

I actually ran both servers together and curled `http://localhost:5173/users`
to confirm the proxy really forwards to Express end-to-end (not just
that the code compiles) — it returned `200 OK` with `x-powered-by: Express`
and the same JSON the backend serves directly.

## Files

**backend/**
- `bin/www` — starts the server on `process.env.PORT || 3001`
- `app.js` — mounts the users router
- `routes/users.js` — `GET /` returns the hardcoded array from the
  exercise

**frontend/**
- `src/App.jsx` — class component, `state = { users: [] }`,
  `componentDidMount` fetches `/users`, renders a `<ul>` of usernames
  keyed by `user.id`

## Note on file naming
As with earlier exercises: `App.jsx` rather than `App.js`, since this
uses Vite (which needs the `.jsx` extension for JSX). Rename to `.js`
with no code changes if you switch to `create-react-app`.
