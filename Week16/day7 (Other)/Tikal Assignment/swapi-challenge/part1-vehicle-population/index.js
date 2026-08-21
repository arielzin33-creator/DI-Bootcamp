import { findVehiclesWithHighestPopulation } from "./findVehiclesWithHighestPopulation.js";

const winners = await findVehiclesWithHighestPopulation();

if (winners.length > 1) {
  console.log(`Tie between ${winners.length} vehicles for the highest sum:\n`);
}

for (const winner of winners) {
  console.table([
    { Field: "Vehicle name with the largest sum", Value: winner.name },
    {
      Field: "Related home planets and their respective population",
      Value: winner.homePlanets.map(([name, population]) => `[${name}, ${population}]`).join(", "),
    },
    { Field: "Related pilot names", Value: `[${winner.pilotNames.join(", ")}]` },
    { Field: "Sum of pilots' home planet populations", Value: winner.populationSum },
  ]);
}
