# Exercise 3 — useDataFetching: A Caching Data-Fetching Hook

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b && vite build
npm test          # vitest run
```

**This fetches real data** from `https://jsonplaceholder.typicode.com/users`. The test suite
mocks `fetch`, but I separately ran a standalone script against the live endpoint: 10 users, and
the first one's shape matches `{ id: number, name: string, email: string }`.

## What's here

- `src/dataCache.ts` — the shared cache itself: a module-level `Map<string, CacheEntry<unknown>>`,
  plus `get` / `set` / `delete` / `isEntryValid` helpers.
- `src/useDataFetching.ts` — the hook: checks the cache before fetching, exposes `refetch`
  (bypasses the cache) and `invalidateCache` (removes the entry).
- `src/UserList.tsx` — the demo, with "Refresh" and "Clear Cache & Refresh" buttons.

## The one deliberate deviation from the instructions, and why

The instructions suggest storing the cache in a `useMemo` or a `ref`. I used a module-level `Map`
instead, and it's not a style preference — a `ref`/`useMemo`-based cache lives inside one hook
instance, tied to one component's lifetime, and it fails the exercise's *own* first success
criterion the moment that component unmounts and remounts (a very ordinary thing to happen —
navigating away and back, a parent re-keying the component): the cache resets to empty on
remount, so "the same request shouldn't cause repeated network calls within `maxAge`" would be
violated by the exact scenario a cache exists to handle. A module-level `Map`, imported by every
component that calls the hook, persists across mounts and is shared by every consumer requesting
the same `url` — which is what actually makes this a *cache* rather than per-render memoisation.
`useDataFetching.test.tsx`'s "cache hit" tests make this concrete: they render two *separate*
hook instances for the same url and confirm the second one starts already `succeeded`, with no
second network call.

## Two real bugs, found and fixed while writing the tests

**A fake-timers leak cascaded into five unrelated test timeouts.** The first draft called
`vi.useRealTimers()` as the last line of one test body. That test's own assertion failed first,
so the cleanup line never ran — every following test then silently inherited frozen fake time,
and every `waitFor` in the file (which polls against real elapsed time) hung until its own
5000ms timeout. The fix is a single `afterEach(() => vi.useRealTimers())` at the top of the
file, which makes that entire class of leak impossible regardless of which test fails.

**The "expired cache" test's premise was wrong, not the hook.** It originally called `rerender()`
on the *same* hook instance after advancing the clock, expecting a second fetch. But the
`useEffect` inside `useDataFetching` only re-runs when `url`, `maxAge`, or an internal
refetch-token change — none of which changed on that rerender, so React correctly never re-ran
the effect at all. Real cache-expiry checking only happens at mount time and inside a triggered
fetch, not continuously while a component stays mounted (there's no background poller, and the
instructions don't ask for one). The test was rewritten to unmount and mount a *fresh* hook
instance after advancing time — the same shape as the "cache hit" test above, just with expired
rather than valid cached data — which is what actually exercises expiry.

## Success criteria, addressed

| Criterion | Status |
|---|---|
| Proper caching — no repeated calls within `maxAge` | Tested via two independent hook instances for the same url |
| Loading and error states | `status: 'idle' \| 'loading' \| 'succeeded' \| 'failed'`; both loading and a non-ok-response error are tested |
| Cache invalidation | `invalidateCache` tested to remove the entry without itself fetching; composed with `refetch` for "Clear Cache & Refresh" |
| Demonstration component shows every state | `UserList.tsx`, with both control buttons |
