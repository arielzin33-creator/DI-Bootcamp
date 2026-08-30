# React Google Map

Matches the [reference demo](http://di-react-google-map.surge.sh/): a Bootstrap page with a
Google Map centered on Tel Aviv (`lat: 32.0853, lng: 34.7818`) with a marker.

## ⚠️ The brief's package doesn't work — read this first

The brief specifies `react-google-maps` (`withScriptjs`, `withGoogleMap`, `GoogleMap`, `Marker`).
**That package is broken on any current React version.** Verified directly, not assumed:

- `npm install react-google-maps` **fails outright** on a fresh React 19 project — its
  `peerDependencies` only allow React 15 or 16.
- Forced through anyway (`--legacy-peer-deps`), it **crashes on the very first render**:
  `TypeError: _react2.default.createFactory is not a function`. `React.createFactory` was
  removed in React 19; the package's internals still call it. White screen, not a warning.
- Last published **November 2022**. It's abandoned.

This project uses **`@react-google-maps/api`** instead — the actively maintained successor,
built by the same maintainer specifically to replace it. Same core concepts (`GoogleMap`,
`Marker`), explicit React 16–19 support, updated as recently as December 2025. See the comment
at the top of `src/components/Map.jsx` for the same explanation in context.

## Setup — you need your own API key

I can't create a Google Cloud project or attach billing on your behalf, so this is the one step
that's yours to do:

1. Go to **[console.cloud.google.com/google/maps-apis](https://console.cloud.google.com/google/maps-apis)**
2. Create (or pick) a project
3. **APIs & Services → Library** → enable **"Maps JavaScript API"**
4. **APIs & Services → Credentials** → Create Credentials → API key
5. Restrict the key to "Maps JavaScript API" and your dev origin (`localhost`)
6. A billing account has to be attached to the project — Google requires this even for
   free-tier usage. The included monthly credit covers normal development.
7. `cp .env.example .env`, paste your key in:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```
8. `npm install && npm run dev` → http://localhost:5173

> Restart the dev server after editing `.env` — Vite only reads it at startup.

## Structure

```
google-map-app/
├── .env.example
└── src/
    ├── App.jsx                  # navbar + title + map, mirrors the demo's layout
    ├── App.css
    ├── main.jsx                 # imports bootstrap.min.css
    └── components/
        ├── Navbar.jsx           # Bootstrap navbar, "MAPS" brand
        └── Map.jsx              # the actual map — see the note at the top of this file
```

## How it meets the brief

| Requirement | Where |
|---|---|
| Map at a specific lat/lng | `Map.jsx` — Tel Aviv, as given: `32.0853, 34.7818` |
| Bootstrap for responsiveness | `main.jsx` imports `bootstrap/dist/css/bootstrap.min.css`; `Navbar.jsx` + `App.jsx` use Bootstrap classes |
| React Google Maps package | `@react-google-maps/api` — see the note above for why not the exact package named |
| Own Maps JavaScript API key | `.env` (yours to provide) |

## Verified

Driven in a real browser, not just written:

- **No key:** clean Bootstrap alert — "No API key found..." — no crash, no broken map area.
- **A key present** (a syntactically-valid placeholder, since a real key needs your Cloud
  billing setup): the entire Google Maps JS bundle loads, `GoogleMap` and `Marker` both mount
  successfully, the 400px map container renders. The only thing that doesn't work with a
  placeholder is the actual map tiles — that needs a real, billed key, which is the one part I
  can't provision myself.
- Console output with a key present matches the **reference demo's own console exactly**: the
  same `google.maps.Marker is deprecated` warning, nothing else. No React errors.
- No horizontal overflow at 1280px or 375px.
- `npm run build` succeeds.

**Not verified:** actual map tiles rendering — that's the one piece that needs your real,
billing-enabled key. Everything up to that point (script load, component mount, layout,
responsiveness) is confirmed working.
