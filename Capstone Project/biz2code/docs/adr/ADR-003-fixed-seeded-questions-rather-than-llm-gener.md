# ADR-003: Fixed, seeded questions rather than LLM-generated ones

**Status:** Accepted  
**Date:** 2026-08-10  
**Deciders:** Project owner

## Context
biz2code's thesis is that LLMs suffer 'AI blind spots' — they cannot reliably infer which analysis a given business idea requires. Letting the LLM invent the questions would reproduce the failure the product exists to prevent.

## Decision
All 20 questions are fixed in question-bank.json. The LLM generates documents only, never questions.

## Options Considered

### Option: Fixed question bank

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | None |
| Scalability | Deterministic, demo-safe |
| Notes | Cannot adapt to unusual ideas |

### Option: LLM-generated questions

| Dimension | Assessment |
|---|---|
| Complexity | High |
| Cost | Per-call cost |
| Scalability | Adapts per idea |
| Notes | Non-deterministic; can fail live; contradicts the product thesis |

## Trade-off Analysis
Determinism is the feature, not a limitation. A gatekeeper that changes its own gates is not a gatekeeper.

## Consequences
- Simpler: the demo cannot go off-script; questions are reviewable and version-controlled.
- Harder: adding a vertical means authoring questions by hand.
- Conditional branching is deferred; dependsOnQuestionId is reserved but unused.
