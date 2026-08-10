# ADR-011: Silent LLM by default, with a scaffolded feedback mode

**Status:** Accepted  
**Date:** 2026-08-10  
**Deciders:** Project owner

## Context
The owner wants a simple demo, but may later want the model to critique answers before approval.

## Decision
Default: the LLM emits document content only. A feedback path exists behind a config flag, off by default, returning a short critique of answers at a gate.

## Options Considered

### Option: Silent, flag-gated feedback

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | None extra |
| Scalability | N/A |
| Notes | Demo stays predictable; the option survives |

### Option: Feedback always on

| Dimension | Assessment |
|---|---|
| Complexity | Medium |
| Cost | More calls |
| Scalability | N/A |
| Notes | Richer gate; another live failure surface |

## Trade-off Analysis
Building the seam now costs little; enabling it during demo week costs a rehearsal.

## Consequences
- Simpler: one code path exercised in the demo.
- Harder: a disabled path risks rotting — it needs at least one unit test.
- If enabled later, gate latency roughly doubles.
