import axios from "axios";
import {
  MOCK_CITIES,
  findMockCityByKey,
  findNearestMockCity,
  searchMockCities,
} from "./mockFixtures";

const API_KEY = import.meta.env.VITE_ACCUWEATHER_API_KEY;
export const USING_MOCK_DATA = !API_KEY;

const BASE_URL = "https://dataservice.accuweather.com";
const http = axios.create({ baseURL: BASE_URL });

// Simulates realistic network latency in mock mode so loading states are
// actually visible/testable, rather than resolving instantly.
function mockDelay(value, ms = 400) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function normalizeCity(raw) {
  return {
    key: raw.key,
    name: raw.name,
    country: raw.country.name,
    adminArea: raw.adminArea.name,
  };
}

function normalizeCurrent(city) {
  const c = city.current;
  return {
    weatherText: c.weatherText,
    icon: c.weatherIcon,
    isDayTime: c.isDayTime,
    temperatureC: c.temperatureC,
    realFeelC: c.realFeelC,
    humidity: c.humidity,
    windKmh: c.windKmh,
  };
}

function normalizeForecast(city) {
  const today = new Date();
  return {
    headline: `${city.forecast[0].dayPhrase} for the next few days in ${city.name}`,
    days: city.forecast.map((day, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() + index);
      return {
        date: date.toISOString(),
        minC: day.minC,
        maxC: day.maxC,
        dayIcon: day.dayIcon,
        dayPhrase: day.dayPhrase,
        nightIcon: day.nightIcon,
        nightPhrase: day.nightPhrase,
      };
    }),
  };
}

// -- AccuWeather response normalizers (real API branch) ---------------------

function normalizeAccuWeatherCity(raw) {
  return {
    key: raw.Key,
    name: raw.LocalizedName,
    country: raw.Country?.LocalizedName,
    adminArea: raw.AdministrativeArea?.LocalizedName,
  };
}

function normalizeAccuWeatherCurrent(raw) {
  return {
    weatherText: raw.WeatherText,
    icon: raw.WeatherIcon,
    isDayTime: raw.IsDayTime,
    temperatureC: raw.Temperature?.Metric?.Value,
    realFeelC: raw.RealFeelTemperature?.Metric?.Value,
    humidity: raw.RelativeHumidity,
    windKmh: raw.Wind?.Speed?.Metric?.Value,
  };
}

function normalizeAccuWeatherForecast(raw) {
  return {
    headline: raw.Headline?.Text,
    days: raw.DailyForecasts.map((day) => ({
      date: day.Date,
      minC: day.Temperature.Minimum.Value,
      maxC: day.Temperature.Maximum.Value,
      dayIcon: day.Day.Icon,
      dayPhrase: day.Day.IconPhrase,
      nightIcon: day.Night.Icon,
      nightPhrase: day.Night.IconPhrase,
    })),
  };
}

// -- Public API ---------------------------------------------------------

export async function searchCities(query) {
  if (USING_MOCK_DATA) {
    return mockDelay(searchMockCities(query).map(normalizeCity));
  }
  const { data } = await http.get("/locations/v1/cities/autocomplete", {
    params: { apikey: API_KEY, q: query },
  });
  return data.map(normalizeAccuWeatherCity);
}

export async function getCurrentConditions(locationKey) {
  if (USING_MOCK_DATA) {
    const city = findMockCityByKey(locationKey);
    if (!city) throw new Error("Location not found.");
    return mockDelay(normalizeCurrent(city));
  }
  const { data } = await http.get(`/currentconditions/v1/${locationKey}`, {
    params: { apikey: API_KEY },
  });
  if (!data?.length) throw new Error("No current conditions available for this location.");
  return normalizeAccuWeatherCurrent(data[0]);
}

export async function getForecast(locationKey) {
  if (USING_MOCK_DATA) {
    const city = findMockCityByKey(locationKey);
    if (!city) throw new Error("Location not found.");
    return mockDelay(normalizeForecast(city));
  }
  const { data } = await http.get(`/forecasts/v1/daily/5day/${locationKey}`, {
    params: { apikey: API_KEY, metric: true },
  });
  return normalizeAccuWeatherForecast(data);
}

export async function getCityByCoordinates(lat, lon) {
  if (USING_MOCK_DATA) {
    const city = findNearestMockCity(lat, lon);
    return mockDelay(city ? normalizeCity(city) : null);
  }
  const { data } = await http.get("/locations/v1/cities/geoposition/search", {
    params: { apikey: API_KEY, q: `${lat},${lon}` },
  });
  return data ? normalizeAccuWeatherCity(data) : null;
}

export const DEFAULT_CITY = normalizeCity(MOCK_CITIES[0]); // Tel Aviv
