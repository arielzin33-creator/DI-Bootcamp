// Local stand-ins for AccuWeather API responses, shaped exactly like the real
// endpoints so weatherClient.js's mock branch and live branch return identical
// shapes to the rest of the app. Used when VITE_ACCUWEATHER_API_KEY is unset —
// see README for how this ties into the API's 50-requests/day limit.
export const MOCK_CITIES = [
  {
    key: "215854",
    name: "Tel Aviv",
    country: { id: "IL", name: "Israel" },
    adminArea: { id: "TA", name: "Tel Aviv" },
    lat: 32.0853,
    lon: 34.7818,
    current: { weatherText: "Sunny", weatherIcon: 1, isDayTime: true, temperatureC: 31, realFeelC: 33, humidity: 58, windKmh: 14 },
    forecast: [
      { minC: 25, maxC: 32, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
      { minC: 25, maxC: 31, dayIcon: 2, dayPhrase: "Mostly sunny", nightIcon: 35, nightPhrase: "Partly cloudy" },
      { minC: 24, maxC: 30, dayIcon: 4, dayPhrase: "Intermittent clouds", nightIcon: 36, nightPhrase: "Intermittent clouds" },
      { minC: 25, maxC: 33, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 33, nightPhrase: "Clear" },
      { minC: 26, maxC: 33, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
    ],
  },
  {
    key: "215842",
    name: "Jerusalem",
    country: { id: "IL", name: "Israel" },
    adminArea: { id: "JM", name: "Jerusalem" },
    lat: 31.7683,
    lon: 35.2137,
    current: { weatherText: "Cloudy", weatherIcon: 7, isDayTime: true, temperatureC: 26, realFeelC: 26, humidity: 45, windKmh: 10 },
    forecast: [
      { minC: 19, maxC: 27, dayIcon: 7, dayPhrase: "Cloudy", nightIcon: 38, nightPhrase: "Mostly cloudy" },
      { minC: 18, maxC: 26, dayIcon: 6, dayPhrase: "Mostly cloudy", nightIcon: 35, nightPhrase: "Partly cloudy" },
      { minC: 18, maxC: 28, dayIcon: 2, dayPhrase: "Mostly sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
      { minC: 19, maxC: 29, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 33, nightPhrase: "Clear" },
      { minC: 20, maxC: 29, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
    ],
  },
  {
    key: "213880",
    name: "Eilat",
    country: { id: "IL", name: "Israel" },
    adminArea: { id: "SO", name: "South District" },
    lat: 29.5577,
    lon: 34.9519,
    current: { weatherText: "Haze", weatherIcon: 5, isDayTime: true, temperatureC: 38, realFeelC: 41, humidity: 22, windKmh: 8 },
    forecast: [
      { minC: 29, maxC: 39, dayIcon: 5, dayPhrase: "Hazy sunshine", nightIcon: 34, nightPhrase: "Mostly clear" },
      { minC: 29, maxC: 40, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 33, nightPhrase: "Clear" },
      { minC: 30, maxC: 41, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 33, nightPhrase: "Clear" },
      { minC: 30, maxC: 40, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
      { minC: 29, maxC: 39, dayIcon: 2, dayPhrase: "Mostly sunny", nightIcon: 35, nightPhrase: "Partly cloudy" },
    ],
  },
  {
    key: "308526",
    name: "Madrid",
    country: { id: "ES", name: "Spain" },
    adminArea: { id: "M", name: "Madrid" },
    lat: 40.4168,
    lon: -3.7038,
    current: { weatherText: "Sunny", weatherIcon: 1, isDayTime: true, temperatureC: 34, realFeelC: 35, humidity: 30, windKmh: 11 },
    forecast: [
      { minC: 19, maxC: 34, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 33, nightPhrase: "Clear" },
      { minC: 20, maxC: 35, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
      { minC: 20, maxC: 33, dayIcon: 2, dayPhrase: "Mostly sunny", nightIcon: 35, nightPhrase: "Partly cloudy" },
      { minC: 19, maxC: 31, dayIcon: 4, dayPhrase: "Intermittent clouds", nightIcon: 36, nightPhrase: "Intermittent clouds" },
      { minC: 18, maxC: 30, dayIcon: 3, dayPhrase: "Partly sunny", nightIcon: 35, nightPhrase: "Partly cloudy" },
    ],
  },
  {
    key: "336654",
    name: "Las Vegas",
    country: { id: "US", name: "United States" },
    adminArea: { id: "NV", name: "Nevada" },
    lat: 36.1699,
    lon: -115.1398,
    current: { weatherText: "Sunny", weatherIcon: 1, isDayTime: true, temperatureC: 40, realFeelC: 43, humidity: 12, windKmh: 9 },
    forecast: [
      { minC: 28, maxC: 41, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 33, nightPhrase: "Clear" },
      { minC: 29, maxC: 42, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 33, nightPhrase: "Clear" },
      { minC: 28, maxC: 40, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
      { minC: 27, maxC: 39, dayIcon: 2, dayPhrase: "Mostly sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
      { minC: 27, maxC: 38, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 33, nightPhrase: "Clear" },
    ],
  },
  {
    key: "349727",
    name: "New York",
    country: { id: "US", name: "United States" },
    adminArea: { id: "NY", name: "New York" },
    lat: 40.7128,
    lon: -74.006,
    current: { weatherText: "Partly sunny", weatherIcon: 3, isDayTime: true, temperatureC: 27, realFeelC: 29, humidity: 55, windKmh: 16 },
    forecast: [
      { minC: 21, maxC: 28, dayIcon: 3, dayPhrase: "Partly sunny", nightIcon: 35, nightPhrase: "Partly cloudy" },
      { minC: 20, maxC: 26, dayIcon: 12, dayPhrase: "Showers", nightIcon: 40, nightPhrase: "T-storms" },
      { minC: 19, maxC: 25, dayIcon: 15, dayPhrase: "T-storms", nightIcon: 41, nightPhrase: "Partly cloudy w/ t-storms" },
      { minC: 18, maxC: 24, dayIcon: 6, dayPhrase: "Mostly cloudy", nightIcon: 38, nightPhrase: "Mostly cloudy" },
      { minC: 19, maxC: 26, dayIcon: 2, dayPhrase: "Mostly sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
    ],
  },
  {
    key: "328328",
    name: "London",
    country: { id: "GB", name: "United Kingdom" },
    adminArea: { id: "LND", name: "London" },
    lat: 51.5074,
    lon: -0.1278,
    current: { weatherText: "Cloudy", weatherIcon: 7, isDayTime: true, temperatureC: 19, realFeelC: 18, humidity: 70, windKmh: 20 },
    forecast: [
      { minC: 13, maxC: 19, dayIcon: 7, dayPhrase: "Cloudy", nightIcon: 38, nightPhrase: "Mostly cloudy" },
      { minC: 12, maxC: 18, dayIcon: 18, dayPhrase: "Rain", nightIcon: 26, nightPhrase: "Freezing rain" },
      { minC: 12, maxC: 17, dayIcon: 12, dayPhrase: "Showers", nightIcon: 40, nightPhrase: "Mostly cloudy w/ showers" },
      { minC: 11, maxC: 18, dayIcon: 6, dayPhrase: "Mostly cloudy", nightIcon: 35, nightPhrase: "Partly cloudy" },
      { minC: 12, maxC: 19, dayIcon: 3, dayPhrase: "Partly sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
    ],
  },
  {
    key: "623",
    name: "Paris",
    country: { id: "FR", name: "France" },
    adminArea: { id: "IDF", name: "Île-de-France" },
    lat: 48.8566,
    lon: 2.3522,
    current: { weatherText: "Mostly sunny", weatherIcon: 2, isDayTime: true, temperatureC: 24, realFeelC: 24, humidity: 50, windKmh: 13 },
    forecast: [
      { minC: 16, maxC: 25, dayIcon: 2, dayPhrase: "Mostly sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
      { minC: 15, maxC: 24, dayIcon: 4, dayPhrase: "Intermittent clouds", nightIcon: 36, nightPhrase: "Intermittent clouds" },
      { minC: 16, maxC: 23, dayIcon: 6, dayPhrase: "Mostly cloudy", nightIcon: 38, nightPhrase: "Mostly cloudy" },
      { minC: 14, maxC: 21, dayIcon: 12, dayPhrase: "Showers", nightIcon: 39, nightPhrase: "Partly cloudy w/ showers" },
      { minC: 13, maxC: 22, dayIcon: 3, dayPhrase: "Partly sunny", nightIcon: 35, nightPhrase: "Partly cloudy" },
    ],
  },
  {
    key: "226396",
    name: "Tokyo",
    country: { id: "JP", name: "Japan" },
    adminArea: { id: "13", name: "Tokyo" },
    lat: 35.6762,
    lon: 139.6503,
    current: { weatherText: "Hazy sunshine", weatherIcon: 5, isDayTime: true, temperatureC: 30, realFeelC: 34, humidity: 68, windKmh: 12 },
    forecast: [
      { minC: 25, maxC: 31, dayIcon: 5, dayPhrase: "Hazy sunshine", nightIcon: 37, nightPhrase: "Hazy moonlight" },
      { minC: 25, maxC: 32, dayIcon: 15, dayPhrase: "T-storms", nightIcon: 41, nightPhrase: "Partly cloudy w/ t-storms" },
      { minC: 24, maxC: 30, dayIcon: 12, dayPhrase: "Showers", nightIcon: 40, nightPhrase: "Mostly cloudy w/ showers" },
      { minC: 24, maxC: 29, dayIcon: 6, dayPhrase: "Mostly cloudy", nightIcon: 38, nightPhrase: "Mostly cloudy" },
      { minC: 25, maxC: 31, dayIcon: 3, dayPhrase: "Partly sunny", nightIcon: 35, nightPhrase: "Partly cloudy" },
    ],
  },
  {
    key: "22889",
    name: "Sydney",
    country: { id: "AU", name: "Australia" },
    adminArea: { id: "NSW", name: "New South Wales" },
    lat: -33.8688,
    lon: 151.2093,
    current: { weatherText: "Windy", weatherIcon: 32, isDayTime: true, temperatureC: 16, realFeelC: 14, humidity: 62, windKmh: 28 },
    forecast: [
      { minC: 11, maxC: 17, dayIcon: 32, dayPhrase: "Windy", nightIcon: 36, nightPhrase: "Intermittent clouds" },
      { minC: 10, maxC: 16, dayIcon: 6, dayPhrase: "Mostly cloudy", nightIcon: 38, nightPhrase: "Mostly cloudy" },
      { minC: 9, maxC: 15, dayIcon: 18, dayPhrase: "Rain", nightIcon: 26, nightPhrase: "Freezing rain" },
      { minC: 9, maxC: 16, dayIcon: 3, dayPhrase: "Partly sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
      { minC: 10, maxC: 18, dayIcon: 1, dayPhrase: "Sunny", nightIcon: 33, nightPhrase: "Clear" },
    ],
  },
  {
    key: "178087",
    name: "Berlin",
    country: { id: "DE", name: "Germany" },
    adminArea: { id: "BE", name: "Berlin" },
    lat: 52.52,
    lon: 13.405,
    current: { weatherText: "Intermittent clouds", weatherIcon: 4, isDayTime: true, temperatureC: 21, realFeelC: 21, humidity: 54, windKmh: 15 },
    forecast: [
      { minC: 13, maxC: 22, dayIcon: 4, dayPhrase: "Intermittent clouds", nightIcon: 36, nightPhrase: "Intermittent clouds" },
      { minC: 12, maxC: 20, dayIcon: 6, dayPhrase: "Mostly cloudy", nightIcon: 38, nightPhrase: "Mostly cloudy" },
      { minC: 11, maxC: 19, dayIcon: 12, dayPhrase: "Showers", nightIcon: 40, nightPhrase: "Mostly cloudy w/ showers" },
      { minC: 10, maxC: 18, dayIcon: 7, dayPhrase: "Cloudy", nightIcon: 38, nightPhrase: "Mostly cloudy" },
      { minC: 11, maxC: 20, dayIcon: 2, dayPhrase: "Mostly sunny", nightIcon: 34, nightPhrase: "Mostly clear" },
    ],
  },
];

export function findMockCityByKey(key) {
  return MOCK_CITIES.find((city) => city.key === key);
}

export function searchMockCities(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return MOCK_CITIES.filter((city) => city.name.toLowerCase().includes(normalized));
}

// Haversine distance in km — used by the mock geoposition lookup to find the
// nearest known city to the browser's reported coordinates.
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestMockCity(lat, lon) {
  return MOCK_CITIES.reduce((nearest, city) => {
    const d = distanceKm(lat, lon, city.lat, city.lon);
    return !nearest || d < nearest.distance ? { city, distance: d } : nearest;
  }, null)?.city;
}
