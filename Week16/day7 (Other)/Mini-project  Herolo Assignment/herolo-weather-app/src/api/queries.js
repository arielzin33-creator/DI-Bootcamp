import { useQuery } from "@tanstack/react-query";
import { searchCities, getCurrentConditions, getForecast } from "./weatherClient";
import { isEnglishCityQuery } from "../utils/validateCityQuery";

// Cached by query text — react-query dedupes identical searches for free, which
// matters given AccuWeather's 50-requests/day limit on a live key.
export function useCityAutocomplete(query) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["cities", trimmed],
    queryFn: () => searchCities(trimmed),
    enabled: trimmed.length >= 2 && isEnglishCityQuery(trimmed),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurrentConditions(locationKey) {
  return useQuery({
    queryKey: ["currentConditions", locationKey],
    queryFn: () => getCurrentConditions(locationKey),
    enabled: Boolean(locationKey),
    staleTime: 5 * 60 * 1000,
  });
}

export function useForecast(locationKey) {
  return useQuery({
    queryKey: ["forecast", locationKey],
    queryFn: () => getForecast(locationKey),
    enabled: Boolean(locationKey),
    staleTime: 5 * 60 * 1000,
  });
}
