import { useEffect, useState } from "react";

// Wraps the browser Geolocation API in a hook so WeatherPage can just
// read { coords, loading, error } instead of dealing with callbacks.
// Powers the "default location via geolocation" bonus.
export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoading(false);
      },
      (geoError) => {
        setError(geoError.message);
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  return { coords, error, loading };
}
