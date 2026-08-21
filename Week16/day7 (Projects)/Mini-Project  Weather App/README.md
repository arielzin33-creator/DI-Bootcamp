# React Weather App

A weather finder matching the [reference demo](http://di-react-weather.surge.sh/): enter a city
and country, get temperature, humidity and conditions from the OpenWeatherMap API.

## Setup — you need your own API key

I can't register an account on your behalf, so this is the one step you have to do:

1. Sign up free at **[openweathermap.org/api](https://openweathermap.org/api)**
2. Copy your key from the **API keys** tab
3. `cp .env.example .env` and paste the key in:
   ```
   VITE_WEATHER_API_KEY=your_key_here
   ```
4. Run it:
   ```bash
   npm install
   npm run dev        # http://localhost:5173
   ```

> ⏳ **A brand-new key takes ~10 min–2 h to activate.** Until then the API returns
> `401 Invalid API key` even though your key is correct. If you see that error right after
> signing up, wait rather than assuming something's broken.

> ⚠️ Vite only reads `.env` at **startup** — restart the dev server after editing it.

## Structure

```
weather-app/
├── .env.example
└── src/
    ├── App.jsx                  # class component — holds state, calls the API
    ├── App.css
    ├── index.css
    └── components/
        ├── Titles.jsx           # heading + subtitle
        ├── Form.jsx             # city + country inputs, submit button
        └── Weather.jsx          # renders the results / error
```

## How it meets the brief

| Requirement | Where |
|---|---|
| Class component with `state` | `App.jsx` — `city`, `country`, `temperature`, `humidity`, `description`, `error` |
| Form, two inputs, a button | `Form.jsx` |
| Fetch on submit | `App.getWeather()` |
| Display the returned info | `Weather.jsx` |
| Own CSS | `App.css` |

## Notes on the implementation

**`cod` is not consistently typed.** OpenWeatherMap returns `"cod": 401` as a *number* but
`"cod": "404"` as a *string* — verified against the live endpoint. Comparing with `===` against
one type silently misses the other, so the code coerces with `String(data.cod)` before comparing.

**A 200 response can still be an error.** Checking `response.ok` alone isn't sufficient; the
`cod` field has to be inspected too.

**Zero is a valid reading.** `Weather.jsx` tests `temperature !== undefined` rather than plain
truthiness. With `{temperature && ...}` a genuine 0°C or 0% humidity would render as nothing —
this is tested below with an Oslo payload.

**The key is visible in the browser.** Vite inlines `VITE_`-prefixed vars into the bundle and the
key appears in the request URL. That's unavoidable in a front-end-only app and fine for a free
weather key, but a key with real cost or write access belongs behind your own backend.

## Verified

Driven in a real browser. Since I have no API key, `fetch` was stubbed with real-shaped
OpenWeatherMap payloads to exercise every branch:

| Case | Result |
|---|---|
| Success (London) | `Location: London, GB · Temperature: 15°C · Humidity: 77% · Conditions: Broken Clouds` (14.62 → 15 rounding correct) |
| **Zero values (Oslo)** | `Temperature: 0°C · Humidity: 0%` — correctly shown, not hidden |
| Empty fields | "Please enter both a city and a country." |
| No API key | "No API key found. Add VITE_WEATHER_API_KEY…" |
| `cod: "404"` | "Couldn't find "Atlantis, xx"…" |
| `cod: 401` | "Invalid API key. Check VITE_WEATHER_API_KEY…" |
| `cod: 429` | "Too many requests — the free plan limit was hit…" |
| Network failure | "Could not reach the weather service…" |

Also confirmed: request URL well-formed
(`…/weather?q=London,uk&units=metric&appid=…`); page does not reload on submit
(`preventDefault` works); styling matches the demo (same gradient, `#f16051` button, 50px title,
Open Sans); no horizontal overflow at 1280px or 375px; `npm run build` succeeds; no console
errors.

**Not verified:** a real call with a live key — that needs your key. Everything up to and
including the request URL is confirmed, so if the key is valid it should work as-is.
