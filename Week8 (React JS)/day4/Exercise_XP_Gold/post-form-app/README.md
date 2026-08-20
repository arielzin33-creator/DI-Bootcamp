# Post user form demo

## Setup
```
npm install
npm run dev
```
Build: `npm run build`

## Files
- `src/UserForm.jsx` — class component: `user`/`email` in state,
  controlled inputs via `onChange`, POSTs to jsonplaceholder on submit
- `src/App.jsx` — imports and renders `UserForm`

## What happens on submit
`handleSubmit` reads `this.state.user`/`this.state.email`, POSTs them
as JSON to `https://jsonplaceholder.typicode.com/users/`, then logs
the parsed response.

I tested the actual endpoint directly (not just compiled the code) —
a POST with `{"user":"Isaac","email":"..."}` returns HTTP 201 and
echoes back your fields plus a fake `id`, e.g.:
```
{ "user": "Isaac", "email": "mymail@example.com", "id": 11 }
```
Note jsonplaceholder is a mock API: it always returns a success
response and a plausible-looking id, but nothing is actually saved
server-side — that's expected and fine for this exercise.

## Note on file naming
Same as the earlier exercises: `.jsx` rather than `.js`, since this
project uses Vite. Rename to `.js` with no code changes if you're
using `create-react-app` instead.
