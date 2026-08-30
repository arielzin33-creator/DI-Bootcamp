// The API layer always returns Celsius (mock data is authored in Celsius, and real
// AccuWeather calls request metric=true) — this is the one place Fahrenheit is
// derived, so the C/F toggle never needs a second network request.
export function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function formatTemperature(celsius, unit) {
  if (celsius === null || celsius === undefined) return "—";
  const value = unit === "F" ? celsiusToFahrenheit(celsius) : celsius;
  return `${Math.round(value)}°${unit}`;
}
