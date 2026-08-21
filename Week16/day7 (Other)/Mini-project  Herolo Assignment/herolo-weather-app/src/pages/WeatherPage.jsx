import { useEffect } from "react";
import { Container, Stack, Skeleton, Alert } from "@mui/material";
import { useSnackbar } from "notistack";
import CitySearchBar from "../components/CitySearchBar";
import CurrentWeatherCard from "../components/CurrentWeatherCard";
import ForecastList from "../components/ForecastList";
import { useAppStore } from "../store/useAppStore";
import { useCurrentConditions, useForecast } from "../api/queries";
import { useGeolocationDefault } from "../hooks/useGeolocationDefault";

export default function WeatherPage() {
  const { enqueueSnackbar } = useSnackbar();
  const selectedLocation = useAppStore((state) => state.selectedLocation);
  const setSelectedLocation = useAppStore((state) => state.setSelectedLocation);
  const unit = useAppStore((state) => state.unit);

  useGeolocationDefault((message) => enqueueSnackbar(message, { variant: "info" }));

  const locationKey = selectedLocation?.key;
  const currentQuery = useCurrentConditions(locationKey);
  const forecastQuery = useForecast(locationKey);

  useEffect(() => {
    if (currentQuery.isError) {
      enqueueSnackbar(currentQuery.error?.message || "Failed to load current weather.", {
        variant: "error",
      });
    }
  }, [currentQuery.isError, currentQuery.error, enqueueSnackbar]);

  useEffect(() => {
    if (forecastQuery.isError) {
      enqueueSnackbar(forecastQuery.error?.message || "Failed to load the forecast.", {
        variant: "error",
      });
    }
  }, [forecastQuery.isError, forecastQuery.error, enqueueSnackbar]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <CitySearchBar onSelectCity={setSelectedLocation} />

        {!selectedLocation && <Skeleton variant="rounded" height={220} />}

        {selectedLocation && currentQuery.isLoading && <Skeleton variant="rounded" height={220} />}

        {selectedLocation && currentQuery.isError && (
          <Alert severity="error">Couldn't load weather for {selectedLocation.name}.</Alert>
        )}

        {selectedLocation && currentQuery.data && (
          <CurrentWeatherCard location={selectedLocation} current={currentQuery.data} unit={unit} />
        )}

        {selectedLocation && forecastQuery.isLoading && <Skeleton variant="rounded" height={160} />}

        {selectedLocation && forecastQuery.data && (
          <ForecastList days={forecastQuery.data.days} unit={unit} />
        )}
      </Stack>
    </Container>
  );
}
