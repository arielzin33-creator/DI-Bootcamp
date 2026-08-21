// Maps AccuWeather's WeatherIcon codes (1-44, https://developer.accuweather.com/weather-icons)
// to an emoji. Emoji render crisply at any size and need no image assets or
// attribution, unlike AccuWeather's own icon set.
const ICON_MAP = {
  1: "☀️", 2: "🌤️", 3: "🌤️", 4: "⛅", 5: "🌥️", 6: "⛅", 7: "☁️", 8: "☁️",
  11: "🌫️", 12: "🌦️", 13: "🌦️", 14: "🌦️", 15: "⛈️", 16: "⛈️", 17: "⛈️",
  18: "🌧️", 19: "🌨️", 20: "🌨️", 21: "🌨️", 22: "❄️", 23: "❄️", 24: "🧊",
  25: "🌨️", 26: "🌧️", 29: "🌨️", 30: "🥵", 31: "🥶", 32: "💨",
  33: "🌙", 34: "🌙", 35: "☁️", 36: "⛅", 37: "🌙", 38: "☁️",
  39: "🌦️", 40: "🌦️", 41: "⛈️", 42: "⛈️", 43: "🌨️", 44: "❄️",
};

export function weatherIconFor(iconCode) {
  return ICON_MAP[iconCode] || "🌡️";
}
