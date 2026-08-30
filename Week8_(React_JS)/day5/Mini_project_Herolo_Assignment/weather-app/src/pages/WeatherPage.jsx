import React, { useEffect, useState } from "react";
import { Container, Stack, Skeleton, Fade } from "@mui/material";
import { useLocation } from "react-router-dom";
import SearchBar from "../components/SearchBar.jsx";
import CurrentWeatherCard from "../components/CurrentWeatherCard.jsx";
import ForecastList from "../components/ForecastList.jsx";
import ErrorToast from "../components/ErrorToast.jsx";
import { useGeolocation } from "../hooks/useGeolocation.js";
import {
  searchLocations,
  getLocationByCoordinates,
  getCurrentConditions,
  getFiveDayForecast,
} from "../api/weatherApi.js";

const DEFAULT_CITY = "Tel Aviv";

export default function WeatherPage() {
  const routerLocation = useLocation();
  const { coords, loading: geoLoading } = useGeolocation();

  // A favorite clicked on the Favorites page arrives here via router
  // state, already resolved to a { key, name, country } object.
  const [selectedLocation, setSelectedLocation] = useState(
    routerLocation.state?.location ?? null
  );
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Resolve the city to show on first load, in priority order:
  // 1) a location passed in via navigation, 2) the browser's
  // geolocation (bonus), 3) Tel Aviv as the spec's documented default.
  useEffect(() => {
    if (selectedLocation) return;
    if (geoLoading) return;

    let cancelled = false;

    async function resolveDefaultLocation() {
      if (coords) {
        try {
          const loc = await getLocationByCoordinates(coords.lat, coords.lon);
          if (!cancelled) setSelectedLocation(loc);
          return;
        } catch {
          // fall through to the Tel Aviv default below
        }
      }

      try {
        const results = await searchLocations(DEFAULT_CITY);
        if (!cancelled && results[0]) setSelectedLocation(results[0]);
      } catch {
        if (!cancelled) {
          setError("Couldn't load the default city. Please search for one.");
          setLoading(false);
        }
      }
    }

    resolveDefaultLocation();
    return () => {
      cancelled = true;
    };
  }, [coords, geoLoading, selectedLocation]);

  useEffect(() => {
    if (!selectedLocation) return;

    let cancelled = false;
    setLoading(true);

    async function loadWeather() {
      try {
        const [currentData, forecastData] = await Promise.all([
          getCurrentConditions(selectedLocation.key),
          getFiveDayForecast(selectedLocation.key),
        ]);
        if (!cancelled) {
          setCurrent(currentData);
          setForecast(forecastData);
        }
      } catch {
        if (!cancelled) {
          setError("Couldn't load weather for this city. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWeather();
    return () => {
      cancelled = true;
    };
  }, [selectedLocation]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <SearchBar onSelect={setSelectedLocation} onError={setError} />

        {loading && (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={140} />
            <Skeleton variant="rounded" height={100} />
          </Stack>
        )}

        {!loading && selectedLocation && current && (
          <Fade in timeout={400}>
            <div>
              <CurrentWeatherCard location={selectedLocation} current={current} />
            </div>
          </Fade>
        )}

        {!loading && forecast && (
          <Fade in timeout={600}>
            <div>
              <ForecastList days={forecast} />
            </div>
          </Fade>
        )}
      </Stack>

      <ErrorToast message={error} onClose={() => setError(null)} />
    </Container>
  );
}
