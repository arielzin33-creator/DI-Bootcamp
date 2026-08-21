// This dataset spans ~4.5 orders of magnitude (Tatooine: 200,000 vs Naboo:
// 4,500,000,000) — a linear height scale would render Tatooine and Bespin as
// near-invisible slivers next to Naboo. A log scale keeps every bar visibly
// distinct while still preserving true relative ordering.
export function computeBarHeights(values, { minHeight, maxHeight }) {
  const logValues = values.map((value) => Math.log10(Math.max(value, 1)));
  const minLog = Math.min(...logValues);
  const maxLog = Math.max(...logValues);
  const logRange = maxLog - minLog;

  return logValues.map((logValue) => {
    // All values identical (or only one data point) — logRange is 0, so
    // there's no meaningful ratio to scale by; every bar gets the max height.
    if (logRange === 0) return maxHeight;
    const ratio = (logValue - minLog) / logRange;
    return minHeight + ratio * (maxHeight - minHeight);
  });
}

export function formatPopulation(value) {
  return value.toLocaleString("en-US");
}
