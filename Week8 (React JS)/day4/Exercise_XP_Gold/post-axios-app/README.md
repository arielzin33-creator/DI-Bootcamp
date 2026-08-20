# Post with axios demo

## Setup
```
npm install
npm run dev
```
Build: `npm run build`

## Files
- `src/PostForm.jsx` — class component with a `constructor(props)`
  calling `super(props)`, state `{ userId, title, body }`, one shared
  `onChange` handler keyed off each input's `name` attribute, and an
  `axios.post` on submit
- `src/App.jsx` — imports and renders `PostForm`

## What happens on submit
`handleSubmit` destructures `userId`/`title`/`body` from state, POSTs
them with `axios.post("https://jsonplaceholder.typicode.com/posts", {...})`,
then logs `response.data`.

I tested the actual endpoint directly with this exact shape (not just
compiled the code) — POSTing `{"userId":"1","title":"Hello","body":"..."}`
returns HTTP 201 and echoes the fields back plus a fake `id`:
```
{ "userId": "1", "title": "Hello", "body": "This is the body text", "id": 101 }
```
As with the fetch version of this exercise, jsonplaceholder is a mock
API — nothing is actually persisted server-side, but the response
shape and status code are real.

## Note on file naming
Same as the earlier exercises: `.jsx` rather than `.js`, since this
project uses Vite. Rename to `.js` with no code changes if you're
using `create-react-app` instead.
