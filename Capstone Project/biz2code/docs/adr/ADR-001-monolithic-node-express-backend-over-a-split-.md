# ADR-001: Monolithic Node/Express backend over a split service topology

**Status:** Accepted  
**Date:** 2026-08-10  
**Deciders:** Project owner

## Context
biz2code must ship in one week, built by a single developer who is learning React and TypeScript concurrently. An earlier draft proposed a Node API plus a separate Python/FastAPI service for LLM work.

## Decision
A single Node.js + Express + TypeScript process serves the API, calls the LLM, runs the calculation layer and renders DOCX files.

## Options Considered

### Option: Single Node monolith

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | None |
| Scalability | Sufficient for one concurrent user |
| Notes | Node is the strongest area of the developer's current stack |

### Option: Node API + Python LLM service

| Dimension | Assessment |
|---|---|
| Complexity | High |
| Cost | None |
| Scalability | Better long-term separation |
| Notes | Two runtimes, two dependency sets, an inter-service contract to maintain |

## Trade-off Analysis
The split buys separation of concerns that a one-week, single-user, local-only build cannot spend. Every integration surface removed is a day not lost to debugging.

## Consequences
- Simpler: one process, one language, one deploy command.
- Harder: if LLM work later needs Python-only libraries, extraction is required.
- Revisit if the project continues past the capstone.
