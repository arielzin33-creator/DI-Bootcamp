# Book List — Generic `List` Component with TypeScript

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b && vite build
npm test          # vitest run
```

## What's here

- `src/Book.ts` — the `Book` type: `id`, `title`, `author`.
- `src/List.tsx` — the generic, reusable list: `List<T>({ items, renderItem, keyExtractor })`.
  `T` is inferred from whatever array is passed as `items`; `renderItem` and the optional
  `keyExtractor` are both typed to receive that same `T`, not `unknown`. No part of `List` itself
  knows or cares that it's ever used with books.
- `src/BookApp.tsx` — `useState<Book[]>`, prepopulated with three books; `addBook` builds a new
  `Book` with a fresh `crypto.randomUUID()` id and appends it.

## The point of the exercise, made concrete in the tests

`List.test.tsx`'s last test doesn't render a `Book` at all — it renders a `Movie` (a completely
unrelated shape: `id: number`, `name`, `year`, no `title`/`author` anywhere) through the exact
same `List` component, with zero changes to `List.tsx`. That's the actual claim "generic
component" is making, checked directly rather than just asserted: if `List` only worked because
it happened to be written once for books and never tried against anything else, this test would
be the place that would catch it.

## Decisions worth explaining

**`keyExtractor` is optional, falling back to array index.** That's fine for `BookApp`, which
only ever appends to the list — but it's the same caveat that applies anywhere an index is used
as a React key: a list that reorders or removes from the middle would need real keys
(`keyExtractor={(book) => book.id}`, as `BookApp` provides) to avoid subtle rendering bugs. The
comment in `List.tsx` says so rather than leaving the fallback unexplained.

**`addBook` generates a fresh id via `crypto.randomUUID()`**, not an incrementing counter — the
test `gives each added book a distinct id, so React keys never collide` exists because a naive
counter based on `books.length` would produce a duplicate id the moment a book is ever removed
and a new one added (a feature this exercise doesn't build, but the id-generation choice is made
robust to it anyway, rather than working only by coincidence of what's built today).

## Success criteria, addressed

| Criterion (from the description) | Where |
|---|---|
| `Book` type: id, title, author | `Book.ts` |
| Generic, reusable `List` component | `List.tsx`; genuine reuse proven in `List.test.tsx` |
| `useState`-managed book list, prepopulated | `BookApp.tsx` |
| `addBook` generates a unique id and appends | tested directly |
| App renders books via `List` + a custom `renderItem` | `BookApp.tsx` |
