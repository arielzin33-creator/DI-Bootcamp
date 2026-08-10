# ADR-008: Deterministic calculation layer; the LLM never does arithmetic

**Status:** Accepted  
**Date:** 2026-08-10  
**Deciders:** Project owner

## Context
The Business Plan requires LTV:CAC, payback period, TCO and revenue projection. LLMs are unreliable at multi-step arithmetic and cannot be audited when they get it wrong.

## Decision
Eleven formulas run in TypeScript over numeric answers and benchmark constants. Results are passed to the LLM as pre-computed facts to narrate. The prompt forbids recalculation.

## Options Considered

### Option: TypeScript calculation layer

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | None |
| Scalability | N/A |
| Notes | Testable, deterministic, unit-testable |

### Option: LLM computes inline

| Dimension | Assessment |
|---|---|
| Complexity | None |
| Cost | None |
| Scalability | N/A |
| Notes | No code to write; unverifiable and non-reproducible |

## Trade-off Analysis
Numbers in a business plan must be reproducible. A figure that changes between runs is worse than no figure.

## Consequences
- Simpler: unit tests cover the maths; the same inputs always give the same outputs.
- Harder: prompts must be written to prevent the model 'helpfully' recomputing.
- Any formula touching a placeholder benchmark returns null and renders 'unvalidated'.
