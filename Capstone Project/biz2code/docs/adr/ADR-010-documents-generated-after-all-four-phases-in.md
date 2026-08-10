# ADR-010: Documents generated after all four phases, in dependency order

**Status:** Accepted  
**Date:** 2026-08-10  
**Deciders:** Project owner

## Context
The Business Plan's 'Product Weaknesses' field synthesises MRD gaps and PRD constraints, so it cannot be produced before those documents exist. An earlier phase-to-document mapping ignored this.

## Decision
All four phases are answered and approved first. Generation then runs MRD, then PRD, then Business Plan.

## Options Considered

### Option: Generate all at the end

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | 3 LLM calls |
| Scalability | N/A |
| Notes | Respects the dependency; simpler state |

### Option: Generate per phase

| Dimension | Assessment |
|---|---|
| Complexity | Medium |
| Cost | More calls |
| Scalability | N/A |
| Notes | Feedback sooner, but the Business Plan would be built in two halves around the other two documents |

## Trade-off Analysis
Per-phase generation would require partial-document state and a merge step, for feedback the silent-mode MVP does not surface anyway.

## Consequences
- Simpler: no partial documents; one generation pipeline.
- Harder: the user sees no output until all four gates pass. Mitigated by the seed project.
- A hidden feedback-loop mode is scaffolded but disabled (ADR-011).
