# Exercise 5 — Managing DOM Elements with useRef and TypeScript

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b && vite build
npm test          # vitest run
```

## What's here

- `src/FocusableInput.tsx` — `useRef<HTMLInputElement | null>(null)`. The `| null` isn't extra
  caution for its own sake: the ref genuinely is `null` on the very first render, before React
  has attached it to the real `<input>` in the DOM, and would be `null` again if the input were
  ever conditionally unmounted. Both places that read `inputRef.current` — the mount effect and
  the click handler — check for that before calling `.focus()`, which is what the type is asking
  the code to do rather than an arbitrary defensive habit.
- A `useEffect` with an empty dependency array focuses the input once, on mount.
- `handleClick` re-focuses it — useful once focus has moved elsewhere (clicked into a different
  field, tabbed away, etc.).

## Success criteria, addressed

| Criterion | Status |
|---|---|
| `useRef<HTMLInputElement \| null>` referencing an input | `FocusableInput.tsx` |
| Focuses on mount via `useEffect`, with a null check | tested — the input has focus immediately after render |
| `handleClick` focuses the input, with a null check | tested — focus moves away to another element, then the button restores it |
