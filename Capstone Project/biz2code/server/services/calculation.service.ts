/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   ★ Deterministic economics. 11 formulas. The LLM never does arithmetic.
 * WHY       Numbers in a business plan must be reproducible. A figure that changes between runs is worse than no figure. Pure functions here means unit tests are trivial.
 * DEPENDS   benchmark.service.ts
 * ADR       ADR-008
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Implement all 11 formulas from question-bank.json calculationLayer
 *   [ ] Return null (never NaN/Infinity) when an input is missing
 *   [ ] Propagate the WEAKEST confidence tier of any input to the result
 */

export type Confidence = 'primary' | 'secondary' | 'tertiary' | 'placeholder';

export interface Computed<T = number> {
  value: T | null;
  confidence: Confidence;
  unvalidatedReason?: string;
}

const WEAK: Confidence[] = ['primary', 'secondary', 'tertiary', 'placeholder'];
/** A result is only as trustworthy as its weakest input. */
export function weakest(...c: Confidence[]): Confidence {
  return c.reduce((a, b) => (WEAK.indexOf(b) > WEAK.indexOf(a) ? b : a), 'primary');
}

function nullIf(cond: boolean, reason: string, value: number, conf: Confidence): Computed {
  return cond ? { value: null, confidence: 'placeholder', unvalidatedReason: reason }
              : { value, confidence: conf };
}

export function payingUsers(reachable: number, conversionPct: number): Computed {
  return nullIf(!reachable || conversionPct == null, 'missing market size or conversion',
    reachable * (conversionPct / 100), 'primary');
}

export function paybackPeriodMonths(cac: Computed, pricePerMonth: number): Computed {
  if (pricePerMonth === 0)
    return { value: null, confidence: 'placeholder',
             unvalidatedReason: 'not applicable for a zero-price model' };
  if (cac.value == null)
    return { value: null, confidence: 'placeholder', unvalidatedReason: 'CAC unvalidated' };
  return { value: cac.value / pricePerMonth, confidence: cac.confidence };
}

// TODO: grossMonthlyRevenue, storeCommission, netMonthlyRevenue, monthlyTco,
// TODO: monthlyProfit, arpuEffective, cacEstimate, ltvEstimate, ltvCacRatio
