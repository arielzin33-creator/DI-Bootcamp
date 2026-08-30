# React Calculator

Matches the [reference demo](http://di-react-calculator.surge.sh/) — same 17-button layout,
colors, and calculation behavior, verified by driving both apps through the identical click
sequences and comparing output directly.

```bash
npm install
npm run dev     # http://localhost:5173
```

## Structure

```
react-calculator/
└── src/
    ├── App.jsx
    ├── App.css                    # colors/layout measured from the demo's computed styles
    ├── utils/evaluate.js          # expression evaluator — unit-tested and mutation-tested
    └── components/
        ├── Calculator.jsx          # class component — owns all state (the brief's requirement)
        ├── Display.jsx             # functional, props-driven
        └── Button.jsx              # functional, props-driven
```

## How it meets the brief

| Requirement | Where |
|---|---|
| Class component with state/props | `Calculator.jsx` (state); `Button.jsx`/`Display.jsx` (props) |
| A button per number/operator, `onClick` | `Calculator.jsx` — `BUTTON_ROWS` + `handleButtonClick` |
| Display calculator + result | `Display.jsx` |
| Styled | `App.css` |

## Behavior — reverse-engineered from the live demo, not guessed

Before writing any code, I drove the reference demo directly (typed sequences, read its actual
DOM) to learn its real behavior rather than assuming a design:

| Input sequence | Demo's actual output | This app |
|---|---|---|
| `1 2 + 5 =` | `"12+5 = 17"` | identical |
| `× 3 =` (chained from the `17` above) | `"17*3 = 51"` | identical |
| `2 + 3 × 4 =` | `"2+3*4 = 14"` (respects × before +) | identical |
| a digit pressed right after a result | starts a fresh calculation, discarding the old expression | identical |
| `5 ÷ 0 =` | `"5/0 = Infinity"` — a raw, unhandled JS `5/0` leaking through | **`"Cannot divide by zero"`** — deliberate improvement, not a gap |

Colors were read from the demo's `getComputedStyle` output directly: body `dimgray`, display
black-on-white, number keys `darkgray`, operators `orange`, AC `rgb(240,240,240)` (not the
`whitesmoke` CSS keyword, which is a barely-different 245,245,245 — confirmed by measuring, then
matched exactly, not eyeballed).

## The evaluator — no `eval()`, and actually tested

`utils/evaluate.js` implements a small two-pass evaluator (resolve `×`/`÷` first, then `+`/`−`)
rather than calling `eval()` on the accumulated expression string. The button-only input has no
injection surface either way, but avoiding `eval` is the right default and costs nothing here.

Before wiring it into any React code, it was unit-tested standalone — 13 cases, including every
behavior observed on the live demo plus edge cases the demo doesn't necessarily exercise
(floating-point noise on `0.1+0.2`, a trailing operator with no right-hand operand, full
precedence chains). **Then mutation-tested**: the `×`/`÷` precedence branch was deliberately
disabled, and 6 of the 13 tests immediately failed — confirming the test suite actually catches
a real regression, not just producing green output that proves nothing.

## A real bug this caught, not a hypothetical

Early testing (rapid-fire scripted clicks with no yield back to the browser's event loop between
them) showed `12+5+*3` accumulating into one long, wrong expression instead of computing `17`
after `=`. The cause: `handleEquals` read `this.state.expression` directly, while `handleDigit`
and `handleOperator` correctly used React's functional `setState((state) => ...)` form. Reading
`this.state` outside that form is only guaranteed current *between* separate browser-dispatched
events — a genuine (if narrow) correctness bug, not just a test artifact, since it meant
`handleEquals` could act on stale state under React's batching. Fixed by converting it to the
same functional pattern as the other two handlers, and by pulling the "current operand" helper
out into a pure function that takes an expression string as an argument instead of silently
reading `this.state` internally — the same class of bug, one level deeper, fixed the same way.

## Verified

- Driven through a real browser with the exact same click sequences run against the live demo;
  output compared field-by-field, not eyeballed.
- Evaluator: 13/13 unit tests, plus a mutation test confirming the suite has real teeth.
- No horizontal overflow at 375px.
- `npm run build` succeeds, no console errors.
