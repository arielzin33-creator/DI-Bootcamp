# Herolo Weather

A responsive React weather app: search any city, view its current conditions
and 5-day forecast, and save favorites locally. Built for the Herolo home
assignment.

## Features

- **Weather page** — search field, current weather, 5-day forecast, and a
  favorite toggle for the currently-viewed location. Defaults to Tel Aviv.
- **Favorites page** — every saved location with its current weather; click
  one to jump back to the Weather page for that city.
- Search is restricted to English letters (validated client-side before any
  request is made).
- **Bonuses implemented:**
  - Geolocation-based default location (falls back to Tel Aviv if permission
    is denied or unavailable).
  - Light/dark theme toggle.
  - Celsius/Fahrenheit toggle (converted client-side — doesn't cost an extra
    API call).

## Stack

- React (Vite) + React Router (`HashRouter` — see note below)
- **Zustand** (with `persist`) for app state: favorites, theme, unit
- **TanStack Query** for API data: caching, loading/error state, and
  deduplication of identical requests
- **MUI (Material UI)** as the third-party UI library
- **notistack** for toast notifications (error handling)
- Axios for HTTP calls

## Running it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` (or whatever port Vite picks). No API key
or backend required — see below.

## About the AccuWeather API key

This assignment calls for the AccuWeather API, which requires signing up for
a free developer account. **The app runs fully functional without one**:
`src/api/weatherClient.js` transparently switches between two implementations
with an identical return shape:

- **No `VITE_ACCUWEATHER_API_KEY` set (default):** uses local mock data
  (`src/api/mockFixtures.js`) covering 11 cities (Tel Aviv, Jerusalem, Eilat,
  Madrid, Las Vegas, New York, London, Paris, Tokyo, Sydney, Berlin) with a
  simulated network delay, so loading states are still visible/testable.
- **With a key set:** makes real calls to AccuWeather's autocomplete, current
  conditions, 5-day forecast, and geoposition-search endpoints.

To use a real key: sign up at https://developer.accuweather.com, copy
`.env.example` to `.env`, and set `VITE_ACCUWEATHER_API_KEY`. No code changes
needed. Worth noting given the API's 50-requests/day limit: TanStack Query
caches every response for 5 minutes, so re-searching or revisiting a city
within that window doesn't cost another request.

## Deploying (GitHub Pages)

```bash
npm run deploy
```

This builds the app and pushes `dist/` to a `gh-pages` branch via the
`gh-pages` package (already configured in `package.json`). Prerequisites:

1. The repo must already exist on GitHub and be set as this project's `origin`
   remote (see the submission steps below).
2. In the repo's Settings → Pages, set the source to the `gh-pages` branch.

The app uses `HashRouter` (URLs look like `/#/favorites`) specifically so
this works correctly on GitHub Pages, which serves static files with no
server-side rewrite rule — a `BrowserRouter` URL like `/favorites` would 404
on a direct load or refresh.

## Submission steps (per the assignment's "How to Submit")

These require your own GitHub account/credentials, so they're not done yet:

```bash
git init -b main
git add .
git commit -m "Initial commit"
# Create a public repo on GitHub named firstName-lastName-dateOfStart, then:
git remote add origin <your-repo-url>
git push -u origin main
npm run deploy
```

Then send both links: the repo URL and the GitHub Pages URL
(`https://<username>.github.io/<repo-name>/`).

## Project structure

```
src/
  api/
    weatherClient.js   Real AccuWeather calls + mock-data fallback, normalized
    mockFixtures.js    Local city/weather data used when no API key is set
    weatherIcons.js    AccuWeather icon code -> emoji
    queries.js         TanStack Query hooks (search, current, forecast)
  store/
    useAppStore.js     Zustand store: favorites, unit, theme, selected location
  components/          Header, search bar, weather/forecast cards, favorite button
  pages/
    WeatherPage.jsx    Search + current weather + forecast
    FavoritesPage.jsx  Saved locations grid
  hooks/
    useGeolocationDefault.js  Geolocation bonus, with Tel Aviv fallback
    useDebouncedValue.js      Debounces the search input
  utils/
    temperature.js     Celsius/Fahrenheit conversion + formatting
    validateCityQuery.js  English-only input validation
```

## Implementation notes

- `selectedLocation` deliberately isn't persisted to localStorage (unlike
  favorites/unit/theme) — the spec requires Tel Aviv as the default on load,
  so every fresh session starts there and geolocation, if available, upgrades
  it from there.
- The favorite button lives outside `CardActionArea` on favorite cards rather
  than nested inside it — a `<button>` can't legally contain another
  `<button>`, and nesting them breaks click semantics (the whole card would
  navigate on any click, including on the favorite icon itself).
- `weatherClient.js` normalizes both the mock and real AccuWeather responses
  into the same shape before they reach any component, so the rest of the
  app — including every hook and component above it — has no branching on
  which data source is active.
