import { useEffect, useState } from "react";
import "./App.css";
import PopulationBarChart from "./components/PopulationBarChart";
import { fetchPlanetsByName } from "./api/swapiClient";

const PLANET_NAMES = ["Tatooine", "Alderaan", "Naboo", "Bespin", "Endor"];

export default function App() {
  const [planets, setPlanets] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlanetsByName(PLANET_NAMES)
      .then((results) =>
        setPlanets(
          results.map((planet) => ({ name: planet.name, population: Number(planet.population) }))
        )
      )
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="page">
      <h1>Star Wars Planet Population</h1>
      {error && <p className="error">{error}</p>}
      {!error && !planets && <p>Loading...</p>}
      {planets && <PopulationBarChart planets={planets} />}
    </main>
  );
}
