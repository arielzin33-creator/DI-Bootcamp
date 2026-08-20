# Exercise 2 — Generic, Type-Safe DataTable

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b && vite build
npm test          # vitest run
```

## What's here

- `src/dataTableTypes.ts` — `TableColumn<T>` and `DataTableProps<T extends { id: number | string }>`.
  `column.key: keyof T` is what makes referencing a field that doesn't exist on `T` a compile
  error in the column definition itself, rather than a silent `undefined` cell at render time.
- `src/DataTable.tsx` — the generic component: sorting (asc → desc → unsorted, cycling on
  repeated header clicks), row and select-all checkboxes, and a `render` escape hatch per column
  for custom cell content.
- `src/App.tsx` — a demo table of people, including one column with a custom `render` (flagging
  anyone 100+) to show `render` receives both the cell's value and the full row.

## Decisions worth explaining

**Internal sorting only happens when `onSort` isn't provided.** If a parent passes `onSort`,
`DataTable` calls it and trusts that `data` already reflects whatever order the parent wants —
sorting it again internally would fight with server-side pagination or any other case where the
parent owns the real ordering. `DataTable.test.tsx` checks both paths: sorting for real when
`onSort` is absent, and leaving `data` untouched (just calling the callback) when it's present.

**Selection is tracked as `Set<T['id']>`, not an array or a boolean-per-row map.** Checking
"is this row selected" needs to be fast and needs to not care about row order — a `Set` gives
O(1) membership checks without needing to search an array, and without needing a second
data structure keyed by something else.

**`onSelect` always receives the full row objects, not just ids.** A parent almost always wants
to *do* something with the selected rows (export them, act on them), and re-deriving the full
objects from a list of ids it was handed back would mean keeping its own copy of `data` around
just to do that lookup. `DataTable` already has `data` in scope, so it does the lookup once,
inside itself, before calling `onSelect`.

**The last test suite (`genuine generic reuse across an unrelated data shape`) is not a
formality.** It renders the exact same `DataTable` component against a `Product` shape that
shares nothing with the `Person` shape used everywhere else in the file — different field names,
a `string` id instead of a `number` — with zero changes to `DataTable.tsx` itself. That's the
concrete way to check the component is actually generic, rather than merely being written with a
type parameter that happens to only ever get used with one shape.

## Success criteria, addressed

| Criterion (from the instructions) | Where |
|---|---|
| Column and table-prop interfaces, with generics | `dataTableTypes.ts` |
| Generic component handling any data structure | `DataTable.tsx`; proven by the cross-shape test |
| Sorting, toggling direction on header click | `handleHeaderClick`, tested through the full asc→desc→unsorted cycle |
| Row selection, individual and select-all | `toggleRow` / `toggleAll`, both tested |
| Table rendered from `data` + `columns` | `App.tsx` demo |
