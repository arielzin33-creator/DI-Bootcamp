# Part 2 — Planet Population Bar Chart

A bar chart (built from plain `div`s — no charting library) comparing the
population of Tatooine, Alderaan, Naboo, Bespin, and Endor, fetched live from
SWAPI.

## Run it

```bash
npm install
npm run dev
```

## Approach

- `src/api/swapiClient.js` — a minimal wrapper (not a library) around the
  one SWAPI call this app needs: search for a planet by name. Since the 5
  planet names are already known up front, `fetchPlanetsByName` fetches all
  5 **in parallel** via `Promise.all`, rather than paginating through
  SWAPI's full planet list and filtering client-side (which would mean
  several sequential page fetches to find 5 planets out of ~60).
- `src/utils/scale.js` — maps population values to bar heights on a
  **logarithmic** scale, not linear. This dataset spans about 4.5 orders of
  magnitude (200,000 → 4,500,000,000); on a linear scale, Tatooine and
  Bespin would render as near-invisible slivers next to Naboo. A log scale
  keeps every bar visibly distinct while still preserving the true relative
  ordering (Naboo > Alderaan > Endor > Bespin > Tatooine).
- `src/components/PopulationBarChart.jsx` computes bar heights with
  `useMemo`, keyed on the planet data — so a re-render triggered by
  something unrelated (this chart sitting inside a larger page, for
  instance) doesn't needlessly redo the scale math.
- No axis is rendered per the brief; each bar carries its own population
  value above it and planet name below it, plus a small legend identifying
  what the bars represent.

## A note on "performant"

With only 5 data points, most micro-optimizations (e.g. `React.memo` on
`Bar`) would add code without a measurable benefit — the real performance
decision here is fetching all 5 planets in one parallel batch instead of
sequentially, which is what actually matters at any realistic dataset size.
