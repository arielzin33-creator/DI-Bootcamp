import { formatPopulation } from "../utils/scale";

export default function Bar({ name, population, heightPx }) {
  return (
    <div className="bar-column">
      <span className="bar-value">{formatPopulation(population)}</span>
      <div className="bar" style={{ height: `${heightPx}px` }} />
      <span className="bar-label">{name}</span>
    </div>
  );
}
