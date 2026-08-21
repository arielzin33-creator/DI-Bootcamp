# React Tic Tac Toe

Matches the behavior of the [reference demo](http://di-react-tic-tac-toe.surge.sh/), learned by
actually playing it (forced wins, a draw, mode switching) and reading its live DOM — not guessed.

```bash
npm install
npm run dev     # http://localhost:5173
```

## Structure

```
tic-tac-toe/
└── src/
    ├── App.jsx                    # state: mode, turn, active, boardState (per the brief)
    ├── App.css
    ├── utils/gameLogic.js         # PATTERNS, win/draw detection, AI move — unit + mutation tested
    └── components/
        ├── Header.jsx
        ├── Controls.jsx            # Versus AI / 2 Players / Reset — real <button>s, not <a href="#">
        ├── Board.jsx                # 3 real rows of 3 columns, per the brief
        ├── Cell.jsx
        └── StatusMessage.jsx
```

## How it meets the brief

| Requirement | Where |
|---|---|
| AI mode + 2-player mode, toggled by clicking buttons | `Controls.jsx` + `App.jsx` |
| Reset at any time | `Controls.jsx` — `Reset board` button |
| `state`: mode, turn, active, boardState | `App.jsx`, using those exact names |
| Rows and columns | `Board.jsx` — real nested row/column markup, not a flat map |
| Mark on click | `Cell.jsx` `onClick` |
| Alternating turns | `App.jsx` `placeMark` |
| Winner / draw message | `StatusMessage.jsx` |
| The given `PATTERNS` array | `utils/gameLogic.js`, verbatim |
| Styling | `App.css` |

## Behavior — learned from the live demo, not assumed

- **Default mode is AI**, not 2P (confirmed: the first click on a fresh page load triggers an
  immediate AI reply).
- **The AI isn't naive.** Reproduced its actual first few moves: it opens in the center, and
  blocks an obvious two-in-a-row rather than playing randomly. `getAiMove` follows the same
  priority order — win if possible, else block, else center, else a corner, else whatever's left.
  Not full minimax (the brief explicitly doesn't require unbeatable), but not a pushover either.
- **Switching mode mid-game starts a fresh board.** Never directly observed on the demo (not
  tested there), but a deliberate choice here — carrying an in-progress board across a mode
  switch would leave an ambiguous "whose AI is it now" state.
- **The board locks on win or draw.** Verified: clicking further cells after the game ends is a
  no-op, matching the demo.

## The AI — unit-tested, then mutation-tested

`utils/gameLogic.js` has no React dependency, so it was tested standalone before ever being
wired into a component — 16 cases covering win detection (all 8 patterns), draw detection
(using the *exact* draw board reproduced from the live demo), and every branch of the AI's move
priority.

Then mutation-tested: the AI's "can I win right now" check was deliberately disabled, and exactly
the 2 tests asserting that priority failed — confirming the suite actually catches a real
regression rather than just producing green output. Reverted immediately after.

## A real race condition, found and fixed — not just reasoned about

The AI's move is deliberately delayed by 400ms (a plain instant reply feels less like the AI is
"thinking"). That delay creates a real hazard: if the human's move is itself the winning move,
React batches the board update and the turn flip to `O` in the same commit. The effect that
schedules the AI's move reads `active` from that same commit — and a sibling effect is the one
that actually sets `active` to `false` once it notices the win, which may not have run yet by the
time the AI-scheduling effect's condition is checked. Without a second check, that stale `active`
would let the AI schedule and then place a move *after* the human had already won.

Fixed by re-deriving the win/draw state from the live board **inside** the `setTimeout` callback
itself, rather than trusting the effect's closed-over `active` — correct regardless of the exact
order React happens to run same-commit effects in.

**Verified live, not just by reasoning about it:** forced a human win against the AI with a
two-corner fork opening (0 and 8, drawing the AI into blocking only one of two resulting threats),
then checked the board an explicit 600ms later — well past the AI's delay. Exactly 3 O's on the
board both immediately after the win and 600ms later; no stray move appeared.

## Verified

- All 6 win-line shapes (3 horizontal, 3 vertical, both diagonals) — real gameplay, not just unit
  tests.
- The exact draw board reproduced from the live demo, played out cell-by-cell.
- Board locks after game over.
- Mode toggle resets the board and updates the active-button highlighting.
- 2P mode confirmed *not* auto-playing for O (unlike AI mode).
- No horizontal overflow at 375px; no console errors; `npm run build` succeeds.
