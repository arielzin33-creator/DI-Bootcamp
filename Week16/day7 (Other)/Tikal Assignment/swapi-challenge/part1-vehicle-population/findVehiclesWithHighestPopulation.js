import { fetchAllPages, fetchByUrls } from "./swapiClient.js";

// SWAPI reports population as a numeric string, or the literal "unknown" for
// planets it has no data on. "unknown" can't contribute to a sum, so it's
// treated as absent rather than 0 — a planet's population being unknown is
// not the same claim as it being zero.
function parsePopulation(populationField) {
  const parsed = Number(populationField);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function findVehiclesWithHighestPopulation() {
  const allVehicles = await fetchAllPages("vehicles");

  // Vehicles with no pilots can't contribute a homeworld-population sum at
  // all, so they're dropped before any pilot/planet network calls are made —
  // the whole point of "as performant as you can" here is fetching only what
  // the answer can actually depend on.
  const pilotedVehicles = allVehicles.filter((vehicle) => vehicle.pilots.length > 0);

  const allPilotUrls = pilotedVehicles.flatMap((vehicle) => vehicle.pilots);
  const pilotsByUrl = await fetchByUrls(allPilotUrls);

  const allHomeworldUrls = [...pilotsByUrl.values()].map((pilot) => pilot.homeworld);
  const planetsByUrl = await fetchByUrls(allHomeworldUrls);

  const vehicleSummaries = pilotedVehicles.map((vehicle) => {
    const pilots = vehicle.pilots.map((url) => pilotsByUrl.get(url));
    const pilotNames = pilots.map((pilot) => pilot.name);

    // Sum is taken per pilot (not per unique planet): a vehicle with two
    // pilots from the same homeworld counts that planet's population twice,
    // matching "sum of population for all its pilots' home planets" read
    // literally — one term per pilot.
    const populationSum = pilots.reduce((sum, pilot) => {
      const planet = planetsByUrl.get(pilot.homeworld);
      const population = parsePopulation(planet.population);
      return population === null ? sum : sum + population;
    }, 0);

    // For display, each home planet is listed once even if shared by
    // multiple pilots — repeating an identical [name, population] pair
    // wouldn't tell the reader anything the sum above doesn't already.
    const uniquePlanetUrls = [...new Set(pilots.map((pilot) => pilot.homeworld))];
    const homePlanets = uniquePlanetUrls.map((url) => {
      const planet = planetsByUrl.get(url);
      return [planet.name, planet.population];
    });

    return { name: vehicle.name, populationSum, homePlanets, pilotNames };
  });

  const highestSum = Math.max(...vehicleSummaries.map((v) => v.populationSum));
  return vehicleSummaries.filter((v) => v.populationSum === highestSum);
}
