/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Loads benchmarks/*.json, resolves a metric for a vertical, falls back cross-vertical.
 * WHY       The guardrail. The LLM may cite ONLY what this returns. Anything unresolved renders 'unvalidated' rather than being invented.
 * DEPENDS   ../data/benchmarks/* (project root, not server/data)
 * ADR       ADR-009
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Load and cache all files at boot
 *   [ ] resolve(vertical, metric) with cross-vertical fallback
 *   [ ] Return the conflicts array when sources disagree — never silently pick one
 *   [ ] Mark PROXY metrics so the document says the figure is borrowed
 */

export interface Metric {
  value: number | null;
  rangeLow: number | null;
  rangeHigh: number | null;
  unit: string;
  confidence: 'primary' | 'secondary' | 'tertiary' | 'placeholder';
  source: { publisher: string | null; url: string | null };
  note: string | null;
  conflicts: Array<{ value: number; source: string; note: string }> | null;
}

// TODO: loadAll() at boot
// TODO: resolve(verticalId, metricKey): Metric & { usedFallback: boolean }
// TODO: isUnvalidated(m): boolean  ->  m.confidence === 'placeholder' || m.value === null
