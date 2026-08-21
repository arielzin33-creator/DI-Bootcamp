// Spec requires English-only search input. Letters, spaces, and the punctuation
// that legitimately shows up in city names or "City, Country" labels (hyphens,
// apostrophes, periods, commas) are allowed; anything outside that (e.g.
// non-Latin scripts) is rejected up front instead of being sent to the API.
const ENGLISH_CITY_PATTERN = /^[A-Za-z\s.,'-]*$/;

export function isEnglishCityQuery(value) {
  return ENGLISH_CITY_PATTERN.test(value);
}
