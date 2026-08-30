import axios from "axios";

const API_KEY = import.meta.env.VITE_ACCUWEATHER_API_KEY;
const BASE_URL = "https://dataservice.accuweather.com";

// A note on this file: the field names read below (Key, LocalizedName,
// WeatherText, Temperature.Metric.Value, etc.) follow AccuWeather's
// documented response shape. I have not verified these against a live
// API key or the current docs, so if a request succeeds but the parsed
// result looks empty or wrong, check your AccuWeather developer console
// response payload against what's destructured here and adjust.

const client = axios.create({ baseURL: BASE_URL });

export async function searchLocations(query) {
  const { data } = await client.get("/locations/v1/cities/autocomplete", {
    params: { apikey: API_KEY, q: query, language: "en-us" },
  });

  return data.map((loc) => ({
    key: loc.Key,
    name: loc.LocalizedName,
    country: loc.Country?.LocalizedName,
    adminArea: loc.AdministrativeArea?.LocalizedName,
  }));
}

export async function getLocationByCoordinates(lat, lon) {
  const { data } = await client.get(
    "/locations/v1/cities/geoposition/search",
    {
      params: { apikey: API_KEY, q: `${lat},${lon}`, language: "en-us" },
    }
  );

  return {
    key: data.Key,
    name: data.LocalizedName,
    country: data.Country?.LocalizedName,
  };
}

export async function getCurrentConditions(locationKey) {
  const { data } = await client.get(`/currentconditions/v1/${locationKey}`, {
    params: { apikey: API_KEY, language: "en-us", details: true },
  });

  const current = data[0];
  return {
    weatherText: current.WeatherText,
    icon: current.WeatherIcon,
    temperatureC: current.Temperature.Metric.Value,
    temperatureF: current.Temperature.Imperial.Value,
    observedAt: current.LocalObservationDateTime,
  };
}

export async function getFiveDayForecast(locationKey) {
  const { data } = await client.get(
    `/forecasts/v1/daily/5day/${locationKey}`,
    { params: { apikey: API_KEY, language: "en-us", metric: true } }
  );

  return data.DailyForecasts.map((day) => ({
    date: day.Date,
    phrase: day.Day.IconPhrase,
    minC: day.Temperature.Minimum.Value,
    maxC: day.Temperature.Maximum.Value,
    minF: celsiusToFahrenheit(day.Temperature.Minimum.Value),
    maxF: celsiusToFahrenheit(day.Temperature.Maximum.Value),
  }));
}

// Converted client-side rather than requesting the endpoint twice
// (once metric, once imperial) — every extra request matters against
// the API's 50-requests-per-day limit.
function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}
