import { useMemo } from "react";
import Bar from "./Bar";
import Legend from "./Legend";
import { computeBarHeights } from "../utils/scale";

const MIN_BAR_HEIGHT = 24;
const MAX_BAR_HEIGHT = 280;

export default function PopulationBarChart({ planets }) {
  // Only recomputed when the actual population values change — with just 5
  // static data points this recalculation is trivially cheap either way, but
  // it also protects against recomputing on every unrelated re-render of a
  // parent (e.g. once this chart sits inside a larger page).
  const heights = useMemo(
    () =>
      computeBarHeights(
        planets.map((planet) => planet.population),
        { minHeight: MIN_BAR_HEIGHT, maxHeight: MAX_BAR_HEIGHT }
      ),
    [planets]
  );

  return (
    <div className="chart">
      <Legend label="Population" />
      <div className="chart-bars" style={{ height: MAX_BAR_HEIGHT }}>
        {planets.map((planet, index) => (
          <Bar
            key={planet.name}
            name={planet.name}
            population={planet.population}
            heightPx={heights[index]}
          />
        ))}
      </div>
    </div>
  );
}
