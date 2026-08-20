# Auto-completed country search

## Setup
```
npm install
npm run dev
```
Build: `npm run build`

## About the countries data
You supplied the actual `Countries.js` file from the repo, so this now
uses that directly (`src/Countries.js`) instead of the reconstruction
from before. It exports a single backtick string of country names
split on `\n`; since the string starts with a newline right after the
opening backtick, the first split element is an empty string, filtered
out in `AutoCompletedText.jsx` via `.filter(Boolean)`. I re-verified
against your screenshot with the real file: typing "a" still returns
exactly 11 matches, same 11 countries, same order.

## Files
- `src/Countries.js` — the country name data, exactly as you provided
- `src/AutoCompletedText.jsx` — class component:
  - `state = { suggestions: [], text: "" }`
  - `handleChange` filters `countries` by `startsWith` (case-
    insensitive) against the typed text, updating both `text` and
    `suggestions`
  - renders the filtered list as clickable `<li>` items, each keyed
    by the country name
  - `handleSelect(country)` sets `text` to the clicked country and
    clears `suggestions`
  - a footer bar always shows `Suggestions: {count}`
- `src/App.jsx` — renders `<AutoCompletedText />`

## Note on file naming
`.jsx` rather than `.js`, same Vite-vs-CRA reason as the earlier
exercises. Rename with no code changes if using `create-react-app`.
