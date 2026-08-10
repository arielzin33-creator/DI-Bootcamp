# ADR-002: Local-only deployment

**Status:** Accepted  
**Date:** 2026-08-10  
**Deciders:** Project owner

## Context
The bootcamp's general instructions require a live deployment. The project owner has explicitly scoped biz2code to run locally, and the deliverables are DOCX files downloaded to disk.

## Decision
The application runs on localhost via `npm run dev`. No container, no cloud target, no CI/CD pipeline.

## Options Considered

### Option: Local only

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | Zero |
| Scalability | N/A |
| Notes | Matches the owner's decision and the offline-file deliverable |

### Option: Render / Vercel deploy

| Dimension | Assessment |
|---|---|
| Complexity | Medium |
| Cost | Free tier |
| Scalability | Public URL |
| Notes | Costs a day; adds env-var and DB-hosting work |

## Trade-off Analysis
This decision is the owner's, made against a documented course requirement. It is recorded here explicitly so the trade-off is visible rather than accidental.

## Consequences
- Simpler: no infra work, no secrets management, no cold starts.
- Harder: the demo depends on the presenter's laptop. Rehearse on the actual machine.
- RISK: if a live URL is graded, this decision costs marks. Confirm before Demo Day.
