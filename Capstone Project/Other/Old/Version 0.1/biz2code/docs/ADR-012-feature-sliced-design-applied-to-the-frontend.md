# ADR-012: Feature-Sliced Design applied to the frontend only

**Status:** Accepted  
**Date:** 2026-08-10  
**Deciders:** Project owner

## Context
FSD describes itself as a methodology for frontend projects. It has no opinion on an Express backend. Two architecture variants were requested: conventional, and FSD-based.

## Decision
Variant B applies FSD (app / pages / widgets-free / features / entities / shared) to the React client, with Steiger in warn-only mode. The backend uses a conventional layered structure in both variants: routes -> controllers -> services -> data.

## Options Considered

### Option: FSD frontend + layered backend

| Dimension | Assessment |
|---|---|
| Complexity | Medium |
| Cost | None |
| Scalability | N/A |
| Notes | Uses each methodology where it applies |

### Option: FSD across both

| Dimension | Assessment |
|---|---|
| Complexity | High |
| Cost | None |
| Scalability | N/A |
| Notes | Forces frontend layer semantics onto server code they were not designed for |

### Option: Conventional both (Variant A)

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | None |
| Scalability | N/A |
| Notes | Fastest to build; less structural discipline to show |

## Trade-off Analysis
FSD's layers encode UI-specific concerns. Mapping 'pages' or 'widgets' onto an HTTP API is a category error. The layered backend is the server-side equivalent and is what both variants use.

## Consequences
- Simpler: each side uses conventions designed for it.
- Harder: two documented structures to maintain; pick ONE to actually build.
- The current spec deprecates Processes and discourages Widgets — neither layer is used.
- Steiger runs warn-only, per the decision to keep rules relaxed under deadline.
