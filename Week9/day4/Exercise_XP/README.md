# Fetching User Data with Redux Thunk

A hand-written thunk action creator, a slice with the loading/succeeded/failed lifecycle it
dispatches into, and a `UserData` component built around that lifecycle.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 11 tests
```

Verified locally with `@reduxjs/toolkit` 2.12.0, `react-redux` 9.3.0, React 18.3, Vite 5.4.

**This app makes a real network call** to `jsonplaceholder.typicode.com`, a public mock API
built for exactly this kind of exercise. I confirmed it was reachable and returning the expected
shape directly (`curl https://jsonplaceholder.typicode.com/users/1`) before writing the thunk
against it, and separately ran the thunk itself against the live endpoint outside the test suite
to confirm the success and 404 paths both behave as the unit tests (which mock `fetch`) claim
they do. Running `npm run dev` needs the runtime to actually have internet access; if it's
offline or the service is ever down, the app will show the "failed" badge state rather than
loading a user, which is itself the failure path working correctly.

## File map

```
src/
  app/store.js
  features/user/userSlice.js       idle/loading/succeeded/failed state, plain reducers
  features/user/thunks.js          fetchUser — the hand-written thunk
  features/user/selectors.js
  features/user/userSlice.test.js  pure reducer tests
  features/user/thunks.test.js     thunk tests against a mocked `fetch`
  components/UserData.jsx          the required component
  components/IdBadge.jsx           presentational badge
```

## How each instruction is satisfied

| Step | Requirement | Where |
|---|---|---|
| 1 | Store with thunk middleware | `app/store.js` |
| 2 | Slice with initial state, success/failure reducers | `userSlice.js` |
| 3 | Thunk action creator, dispatches based on response | `thunks.js` |
| 4 | `UserData` component, `useSelector` for state | `components/UserData.jsx` |
| 5 | `useSelector` + `useDispatch` wired together | `components/UserData.jsx` |
| 6 | Fetch / display / error-handling tests | `userSlice.test.js`, `thunks.test.js` |

## Decisions worth explaining

**`configureStore` already includes the thunk middleware — there's nothing to add.** The
instructions say to "include the necessary middleware, such as redux-thunk," which describes the
classic pre-Redux-Toolkit setup (`applyMiddleware(thunk)`). `configureStore`'s default middleware
stack has included thunk since Redux Toolkit's first release; there's no `redux-thunk` package to
install separately and no `middleware:` option to write for this to work. `store.js` says this
directly rather than adding middleware configuration that would just duplicate what's already
there.

**The thunk is hand-written rather than built with `createAsyncThunk`.** `createAsyncThunk` is
what you'd reach for in a real project — it generates the `pending` / `fulfilled` / `rejected`
actions and the matching `extraReducers` cases for you. The exercise specifically asks for a
thunk that dispatches distinct success/failure actions into reducers you write, which is the
manual version of exactly what `createAsyncThunk` automates. `thunks.js` says so, so the
connection isn't lost if this pattern gets replaced with `createAsyncThunk` later.

**`data` starts at `null`, not `{}`.** An empty object can't be distinguished from "a user record
with no fields" the way `null` can be distinguished from "nothing has loaded yet" — checking
`user === null` is unambiguous in a way `Object.keys(user).length === 0` isn't once the shape has
any optional fields.

**An aborted request is swallowed, not dispatched as a failure.** `UserData` cancels the
in-flight request via `AbortController` whenever `selectedId` changes or the component unmounts,
so switching from user 3 to user 4 quickly doesn't risk user 3's slower response resolving second
and overwriting user 4 on screen. The thunk checks `error.name === 'AbortError'` and returns
without dispatching `userFetchFailed` — a cancelled request isn't a failed one, and showing an
error for something the user (or the component) intentionally interrupted would be misleading.

**`userFetchFailed` doesn't clear `data`.** Retrying a lookup that fails after a previous success
leaves the last known-good record in state rather than wiping it — only `status` and `error`
change. The reducer test asserts this explicitly (`userSlice.test.js`, "leaves any stale data
untouched"), since it's an easy detail to get backwards while writing the reducer.

## Validating it

**Reducers** (`userSlice.test.js`, 5 tests): pure input → output checks with no networking
involved — the initial state shape, and each of the four actions in isolation, including the
stale-data-preservation case above.

**Thunk** (`thunks.test.js`, 6 tests): `global.fetch` is mocked with `vi.stubGlobal` so these
tests never touch the network, and dispatch the thunk against a real store built with
`configureStore` to observe the resulting state rather than mocking `dispatch` itself. Covered:
`userFetchStarted` dispatches synchronously before the request resolves (checked by inspecting
store state from inside the mocked `fetch`'s executor, while the "request" is still pending); a
200 response producing `succeeded`; a 404 producing the specific "no user with id" message; a
500 producing the generic status-code message; a rejected `fetch` promise (simulating a network
failure, e.g. offline) producing `failed` with the underlying error's message; and an aborted
request leaving the store in `loading` rather than dispatching a failure.

**Beyond the test suite**, I ran the thunk directly against the live API outside of any mock —
dispatching `fetchUser(3)` against a real store returned the actual Clementine Bauch record from
`jsonplaceholder.typicode.com`, and `fetchUser(999)` produced `status: 'failed'` with the exact
404 message the code generates, without touching the `data` left over from the prior success.
That's what confirms the mocked thunk tests aren't just testing my mock — the real endpoint
behaves the way the tests assume it does.

## What's stubbed rather than built out

There's no retry backoff or request de-duplication beyond the one `AbortController` guard, and no
caching of previously-fetched users — switching back to a user already seen this session re-fetches
it rather than reusing the earlier result.
