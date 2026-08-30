// A minimal wrapper around SWAPI — not a library, just the one call this app
// needs. The brief explicitly allows either calling SWAPI directly or
// writing your own thin wrapper; this is the latter.
const BASE_URL = "https://swapi.py4e.com/api";

export async function fetchPlanetByName(name) {
  const response = await fetch(`${BASE_URL}/planets/?search=${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error(`SWAPI request failed (${response.status}) for planet "${name}"`);
  }
  const data = await response.json();
  const planet = data.results.find((result) => result.name === name);
  if (!planet) {
    throw new Error(`Planet "${name}" not found in SWAPI`);
  }
  return planet;
}

// Fetches every requested planet in a single parallel batch rather than one
// request after another — with 5 independent lookups, there's no reason to
// pay for their latency sequentially.
export async function fetchPlanetsByName(names) {
  return Promise.all(names.map(fetchPlanetByName));
}
