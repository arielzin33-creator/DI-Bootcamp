# Age Tracker — Redux Toolkit, `createAsyncThunk`

A single slice, two `createAsyncThunk` action creators, and a display/controls pair — the
smallest project in this series, but the first to actually use `createAsyncThunk` rather than a
hand-written thunk.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 7 tests
```

Verified locally with `@reduxjs/toolkit` 2.12.0, `react-redux` 9.3.0, React 18.3, Vite 5.4.

## File map

```
src/
  app/store.js
  features/age/ageSlice.js       ageUpAsync, ageDownAsync, extraReducers
  features/age/selectors.js
  features/age/ageSlice.test.js
  components/AgeDisplay.jsx      current age + loading spinner
  components/AgeControls.jsx     Age up / Age down / Reset
```

## How each instruction is satisfied

| Step | Requirement | Where |
|---|---|---|
| 1 | `configureStore` | `app/store.js` |
| 2 | `ageUpAsync` / `ageDownAsync` via `createAsyncThunk`, simulated delay | `ageSlice.js` |
| 3 | Slice with `age`/`loading`, extraReducers for both thunks | `ageSlice.js` |
| 4 | `AgeDisplay` (current age + loading icon), `AgeControls` (buttons) | `components/` |
| 5 | `Provider`, thunk middleware | `main.jsx`, `store.js` (thunk is automatic — see below) |

## Decisions worth explaining

**This is the first exercise in the series to actually use `createAsyncThunk`**, rather than a
hand-written thunk — the earlier exercises wrote thunks by hand specifically because their
instructions asked for explicit success/failure action dispatching, and I noted each time that
`createAsyncThunk` is what you'd reach for instead in a real project. This exercise asks for it
by name, so this is that pattern in practice: `ageUpAsync` and `ageDownAsync` are plain functions
that return a promise; `createAsyncThunk` wraps each one so dispatching it automatically fires
`pending`, then exactly one of `fulfilled` or `rejected` — none of those three action types are
written or dispatched by hand anywhere in this code, only handled in `extraReducers`.

**Each thunk resolves with a signed delta (`+1` / `-1`), not the new age.** The reducer applies
`state.age = Math.max(0, state.age + action.payload)`. This splits "what changed" (the thunk's
job — increment or decrement) from "what the total is allowed to be" (the reducer's job — never
negative). A thunk that computed and returned the *new* age itself would need to duplicate the
clamping logic to avoid ever proposing a negative value, in a place further from where the state
shape is actually defined.

**The `.rejected` cases exist even though neither thunk can currently fail.** Both payload
creators only `await` a timeout and return a number — no network call, no validation that could
throw. I added `ageUpAsync.rejected` / `ageDownAsync.rejected` handlers anyway, because
`createAsyncThunk` always dispatches `pending` and then exactly one of `fulfilled`/`rejected`; if
this were ever extended to make a real request that could actually reject, an app without a
`.rejected` handler would leave `loading` stuck at `true` forever on failure instead of
recovering visibly. The test suite is honest about this rather than fabricating a fake failure
mode to exercise it "properly" — it constructs a `rejected`-shaped action directly and feeds it
to the reducer, rather than pretending the thunk itself can be made to reject.

**Both buttons disable during any request, not just the one clicked.** The slice tracks one
shared `loading` flag (matching the exercise's state shape — `age` and `loading`, not one loading
flag per direction), so a second click mid-flight would just queue an overlapping delay rather
than accomplish anything useful; disabling both is simpler and clearer than trying to reconcile
two overlapping in-flight updates.

**`configureStore`'s default middleware already includes thunk** — same note as the two previous
thunk exercises in this series. There's no separate `redux-thunk` install or `middleware:` option
needed for `dispatch(ageUpAsync())` to work.

## Validating it

7 tests, all using `vi.useFakeTimers()` to control the simulated 600ms delay deterministically
rather than actually waiting on it: `loading` becomes `true` synchronously before the delay
resolves; a successful age-up increments by 1 and clears `loading`; age-down decrements; age
clamps at 0 rather than going negative; two sequential dispatches both land correctly; and the
rejected branch (constructed directly, per the note above) clears `loading` and records the error
message.

## What's stubbed rather than built out

There's no persistence between reloads, and no way to jump to a specific age other than
`ageReset` back to the starting value of 25. The candle row in `AgeDisplay` caps its visual count
at 12 and shows a `+N` beyond that — a real birthday cake past a dozen candles stops being a
useful visualization and starts being a fire hazard, symbolic or not.
