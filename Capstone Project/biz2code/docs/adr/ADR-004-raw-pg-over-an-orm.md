# ADR-004: Raw pg over an ORM

**Status:** Accepted  
**Date:** 2026-08-10  
**Deciders:** Project owner

## Context
The schema is five tables. The developer was taught SQL and Knex, not Prisma. TypeScript is being learned during the build.

## Decision
Use the `pg` driver directly, behind a thin typed query wrapper (~30 lines). Migrations are hand-written numbered .sql files.

## Options Considered

### Option: Raw pg + typed wrapper

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | None |
| Scalability | Fine at this scale |
| Notes | SQL is visible and gradeable |

### Option: Prisma

| Dimension | Assessment |
|---|---|
| Complexity | Medium |
| Cost | None |
| Scalability | Excellent |
| Notes | Generated types, migrations — but a new tool to learn mid-build |

### Option: Knex

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | None |
| Scalability | Fine |
| Notes | Taught in the course, but still an abstraction over visible SQL |

## Trade-off Analysis
Hand-written SQL is defensible at five tables and keeps the query logic legible to an assessor. The cost is real: no migration tooling and no generated types. The wrapper recovers typing at the call site; schema changes are managed manually.

## Consequences
- Simpler: no ORM to learn, SQL is explicit and reviewable.
- Harder: no automatic migrations; every schema change is a manual file.
- Without the typed wrapper every row is `any`, which would undercut the reason for using TypeScript.
