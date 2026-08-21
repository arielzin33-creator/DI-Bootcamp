import { useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import { getCityByCoordinates, DEFAULT_CITY } from "../api/weatherClient";

// Bonus: default to the user's actual location via the Geolocation API,
// falling back to Tel Aviv (the spec's required default) when permission is
// denied, unavailable, or the lookup fails. Tel Aviv is shown immediately
// rather than waiting on the permission prompt, then silently upgraded if
// geolocation succeeds — so there's never a blank loading state on first load.
export function useGeolocationDefault(onError) {
  const selectedLocation = useAppStore((state) => state.selectedLocation);
  const setSelectedLocation = useAppStore((state) => state.setSelectedLocation);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    if (!selectedLocation) {
      setSelectedLocation(DEFAULT_CITY);
    }

    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const city = await getCityByCoordinates(
            position.coords.latitude,
            position.coords.longitude
          );
          if (city) setSelectedLocation(city);
        } catch {
          onError?.("Could not resolve your location to a city. Showing Tel Aviv instead.");
        }
      },
      () => {
        // Permission denied / unavailable / timeout — Tel Aviv default already applied above.
      },
      { timeout: 8000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
