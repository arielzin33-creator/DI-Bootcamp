# ADR-009: Guardrailed generation: benchmarks file plus two keyless APIs

**Status:** Accepted  
**Date:** 2026-08-10  
**Deciders:** Project owner

## Context
No free API publishes app-industry benchmarks; they live in vendor reports. Unconstrained generation would invent figures — the exact failure biz2code argues against.

## Decision
The LLM may cite ONLY (a) the user's own answers, (b) benchmarks/*.json, (c) responses from the World Bank Indicators API and the Apple iTunes Search API. Anything else renders 'unvalidated'.

## Options Considered

### Option: Constants file + 2 keyless APIs

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | Free |
| Scalability | N/A |
| Notes | Inspectable, offline-safe, cacheable |

### Option: Web-search / RAG grounding

| Dimension | Assessment |
|---|---|
| Complexity | High |
| Cost | Varies |
| Scalability | N/A |
| Notes | Broader coverage; reintroduces unverifiable citations |

### Option: Paid benchmark API

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | $111/mo+ |
| Scalability | N/A |
| Notes | Authoritative, out of budget |

## Trade-off Analysis
A narrow, auditable source set beats a broad, unverifiable one for a product whose pitch is epistemic discipline.

## Consequences
- Simpler: the guardrail is a file you can open on stage.
- Harder: coverage is thin — 43 of 194 vertical metrics sourced; the rest render 'unvalidated'.
- iTunes has no CORS headers and ~20 req/min, so calls are server-side and cached.
- Where sources conflict (fintech, social), the document must surface the disagreement.
