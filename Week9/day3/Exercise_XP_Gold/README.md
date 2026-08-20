# User Authentication — React-Redux + Redux Toolkit

One slice, three reducers, conditional rendering driven entirely by `isAuthenticated`. No thunks,
no simulated delay — this exercise describes a synchronous flow, unlike the login simulation in
the e-commerce exercise earlier in this series, so that's what's built.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 10 tests
```

Verified locally with `@reduxjs/toolkit` 2.12.0, `react-redux` 9.3.0,
`@testing-library/react` 16.3.2, React 18.3, Vite 5.4.

## File map

```
src/
  app/store.js
  features/auth/authSlice.js      loginUser, setUser, logoutUser
  features/auth/selectors.js
  features/auth/authSlice.test.js
  components/AuthGate.jsx         the conditional-rendering component
  components/Login.jsx
  components/Logout.jsx
  components/ProfileEditor.jsx    gives setUser a real, distinct purpose (see below)
  components/AuthGate.test.jsx    conditional-rendering + full flow tests
```

## How each instruction is satisfied

| Step | Requirement | Where |
|---|---|---|
| 1 | Slice: `loginUser`, `setUser`, `logoutUser` | `authSlice.js` |
| 2 | `configureStore` with the slice | `app/store.js` |
| 3 | Login, Logout, conditional-rendering components | `Login.jsx`, `Logout.jsx`, `AuthGate.jsx` |
| 4 | `useSelector` + `useDispatch` wiring | all four components |
| 5 | Login/logout + conditional-rendering tests | `authSlice.test.js`, `AuthGate.test.jsx` |

## Decisions worth explaining

**`loginUser` and `setUser` needed a reason not to be redundant, and I gave them one.** Both are
listed as ways of "storing user information upon login," which read like the same operation
named twice. Rather than implement `setUser` as a second, unused copy of what `loginUser` already
does, I gave each a distinct job: `loginUser` is the full transition — flips `isAuthenticated` on
*and* stores the user in one step, which is what `Login` dispatches. `setUser` only updates
fields on a user who's already logged in (a display-name edit, here), and deliberately leaves
`isAuthenticated` untouched. `ProfileEditor` is the component that gives `setUser` a real reason
to exist rather than being decorative — without it, the exercise's third reducer would have no UI
that ever calls it.

**`setUser` is a no-op while logged out, not an error.** Dispatching it with no user object to
merge into (`state.user` is `null`) just returns early rather than throwing or crash-merging into
`null`. The reducer test asserts this directly, and it holds up naturally anyway —
`ProfileEditor` is only ever rendered inside the authenticated branch of `AuthGate`, so this path
isn't reachable through the UI at all; the reducer is just defensive on its own terms.

**No thunk, no simulated delay, no loading state.** The e-commerce exercise earlier in this
series built a `simulateLogin` thunk with an artificial 500ms delay specifically because its
instructions described an async flow. This exercise doesn't — Step 3 says `Login` dispatches
`loginUser` directly, with no mention of a pending state. Forcing in a fake delay here would be
solving a problem this exercise doesn't have, the same calibration made in the basic-todo-list
exercise right before this one.

**Both selectors are plain functions, not `createSelector`**, for the same reason as that same
basic-todo-list exercise: neither derives anything from state, so there's no new array or object
reference for memoisation to protect against.

## Validating it

**Reducers** (`authSlice.test.js`, 4 tests): `loginUser` sets both fields at once; `setUser`
merges into an existing user without touching `isAuthenticated`, and is confirmed to be a no-op
while logged out; `logoutUser` clears both fields back to the initial shape.

**Conditional rendering and full flows** (`AuthGate.test.jsx`, 6 tests): the login form renders
when logged out and the welcome content renders when logged in (Step 5's second numbered item,
almost verbatim); logging in through the real form reveals the members-only content and updates
the store to match; an empty username submission is rejected; logging out returns to the login
form; and editing the display name through `ProfileEditor` updates what's displayed without
logging the user out, confirming `setUser` and `loginUser` really do stay independent of each
other rather than one silently doing the other's job.

## What's stubbed rather than built out

There's no password field and no failure path — any non-empty username logs in successfully.
That's a deliberate simplification for an exercise that doesn't ask for simulated credential
checking at all, not an oversight; if this needed to look more like a real login, the demo
password pattern documented in the e-commerce exercise's `authThunks.js` is where that logic
would go.
