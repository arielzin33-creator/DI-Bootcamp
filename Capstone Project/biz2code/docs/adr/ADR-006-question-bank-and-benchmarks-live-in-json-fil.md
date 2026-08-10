# ADR-006: Question bank and benchmarks live in JSON files, not the database

**Status:** Accepted  
**Date:** 2026-08-10  
**Deciders:** Project owner

## Context
Questions and benchmarks are authored content, reviewed like code, and must be inspectable during the demo to prove the guardrail exists.

## Decision
question-bank.json and benchmarks/*.json ship in the repo. The DB stores answers and generated output, referencing question_id and vertical_id as opaque strings.

## Options Considered

### Option: JSON in repo

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | None |
| Scalability | N/A |
| Notes | Diffable, reviewable, openable on stage; validated in CI |

### Option: Seeded DB tables

| Dimension | Assessment |
|---|---|
| Complexity | Medium |
| Cost | None |
| Scalability | N/A |
| Notes | Needs an admin UI or SQL to inspect; not visible in a diff |

## Trade-off Analysis
The benchmark file is a guardrail you can point at. That argument is weaker if the data is hidden in a table. The cost is referential integrity — a question_id typo is caught by a validator, not a foreign key.

## Consequences
- Simpler: content changes are pull requests; validators run in CI.
- Harder: no FK enforcement between answers.question_id and the bank. Validator must cover it.
- answers rows can outlive a question that is later removed — the validator flags orphans.
