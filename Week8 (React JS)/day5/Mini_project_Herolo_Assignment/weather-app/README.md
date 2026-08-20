# Herolo Weather App

A responsive React app that shows current weather and a 5-day forecast
for any city, with a locally persisted favorites list. Built with
Vite, React Router, and MUI (Material UI), per the assignment's
recommendation to use a third-party UI library.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Get an AccuWeather API key at https://developer.accuweather.com,
   copy `.env.example` to `.env`, and paste your key in:
   ```
   VITE_ACCUWEATHER_API_KEY=your_key_here
   ```
3. Run the dev server:
   ```
   npm run dev
   ```
4. Build for deployment:
   ```
   npm run build
   ```
   This outputs a static `dist/` folder you can deploy to GitHub
   Pages, Netlify, Vercel, or any static host.

## Project structure

```
src/
  api/weatherApi.js       AccuWeather API calls (autocomplete, current
                          conditions, 5-day forecast, geoposition lookup)
  context/AppContext.jsx  Global state via useReducer + useContext:
                          favorites, theme, units — persisted to
                          localStorage
  hooks/useGeolocation.js Wraps navigator.geolocation for the default-
                          location bonus
  components/             Header, SearchBar, CurrentWeatherCard,
                          ForecastList, ErrorToast
  pages/
    WeatherPage.jsx        Main screen: search, current weather, forecast
    FavoritesPage.jsx      Saved cities with live current weather
```

## Notes on the AccuWeather integration

- The API is capped at 50 requests/day. The search box is debounced
  (400ms) to avoid firing a request per keystroke, and the forecast
  endpoint is requested once in metric units, then converted to
  Fahrenheit client-side rather than calling it twice.
- I wrote the response parsing in `weatherApi.js` from AccuWeather's
  documented response shape, but I have not run it against a live key —
  if a request succeeds but a field comes back undefined, check the
  actual JSON payload in your browser's network tab against the
  destructuring in that file and adjust field names as needed.
- During development, consider caching a few sample responses locally
  (as the assignment suggests) instead of hitting the live API on
  every reload.

## Implemented

- Two pages: weather (search + current + 5-day forecast) and favorites
- Add/remove favorites, persisted in `localStorage`
- Favorite indication and toggle button on the weather page
- English-only search input validation
- State management via Context + useReducer (no prop drilling)
- Responsive layout (CSS grid for the forecast strip, MUI Grid for
  favorites)
- Error handling via a Snackbar/toast for failed requests
- Bonuses: geolocation-based default city (falls back to Tel Aviv),
  dark/light theme toggle, Celsius/Fahrenheit toggle, subtle fade-in
  animations on weather load
