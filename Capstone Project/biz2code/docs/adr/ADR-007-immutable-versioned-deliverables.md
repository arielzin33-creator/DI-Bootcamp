# ADR-007: Immutable versioned deliverables

**Status:** Accepted  
**Date:** 2026-08-10  
**Deciders:** Project owner

## Context
Revising an answer must not silently destroy the previously generated document.

## Decision
Every generation writes a new deliverables row with an incremented version and its own file (MRD_v1.docx, MRD_v2.docx). Nothing is overwritten.

## Options Considered

### Option: Versioned rows + files

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | Disk only |
| Scalability | N/A |
| Notes | Full history; a revise is auditable |

### Option: Overwrite in place

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | Least disk |
| Scalability | N/A |
| Notes | Cheaper, but destroys the evidence a gatekeeper exists to produce |

## Trade-off Analysis
An approval workflow whose outputs can be silently mutated is not an approval workflow. Versioning is the cheapest way to make the gate meaningful.

## Consequences
- Simpler: history is free; comparing v1 to v2 demonstrates the revise loop live.
- Harder: disk grows; no pruning in the MVP.
- Re-downloading old versions is out of MVP scope, though the data supports it.
