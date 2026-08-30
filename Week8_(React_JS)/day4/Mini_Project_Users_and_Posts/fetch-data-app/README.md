# Fetch data demo (posts + users)

## Setup
```
npm install
npm run dev
```
Build: `npm run build`

## Files
- `src/PostList.jsx` — fetches https://jsonplaceholder.typicode.com/posts
  in `componentDidMount`, state `{ posts, errorMsg }`
- `src/UsersList.jsx` — fetches https://jsonplaceholder.typicode.com/users
  in `componentDidMount`, state `{ users, isLoaded }`
- `src/App.jsx` — renders both

## What matches the screenshots you shared
- `PostList` renders a "List of posts:" heading, then each post as its
  own block: `ID:`, `Title:`, `Body:` with bold labels — this is the
  Part III end-state. (Part I, before that redesign, would have just
  mapped `post.title` as plain centered text with no ID/body/labels —
  I didn't ship that as a separate file since only the final version
  gets imported into `App.js`.)
- `UsersList` shows "Loading..." while `isLoaded` is false, then a
  "List of users:" heading with each user as a block: `ID`, `Name`,
  `Username`, `Email`, `City` (from the nested `user.address.city`).
  This replaces Part II's simpler bulleted `Name | Email` `<li>` list.

## A small addition beyond the screenshots
`PostList`'s state included `errorMsg` from Part I's instructions, so
I used it: if the fetch fails, an error message renders instead of a
blank page. None of the screenshots show a failure state, so this is
an addition on my part, not something depicted — flagging it in case
you want it removed to match a stricter reading of the spec.

## Note on file naming
Same as the earlier exercises: `.jsx` rather than `.js`, since this
project uses Vite. Rename to `.js` with no code changes if you're
using `create-react-app` instead.
