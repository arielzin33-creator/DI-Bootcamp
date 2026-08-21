export default function Legend({ label }) {
  return (
    <div className="legend">
      <span className="legend-swatch" />
      <span>{label}</span>
    </div>
  );
}
