# Post list demo

## Setup
```
npm install
npm run dev
```
Build: `npm run build`

## Files
- `src/data/posts.json` — the two posts from the linked source data,
  copied verbatim
- `src/PostList.jsx` — imports posts.json and renders each post's
  title and content
- `src/App.jsx` — renders `<PostList />`

## Note on file naming
As with the previous exercise: this uses Vite, whose default JSX
parsing only applies to `.jsx`/`.tsx` files, so components are named
`PostList.jsx` / `App.jsx` rather than `.js`. If you're using
`create-react-app` instead (which parses JSX in `.js` fine via
Babel), you can rename these to `.js` with no code changes.
