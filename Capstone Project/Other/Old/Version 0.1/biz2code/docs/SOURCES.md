# Benchmark Data Layer — Sourcing & Honesty Contract

## What this is

A curated, inspectable set of industry benchmark constants that the LLM is
**hard-constrained** to cite from. It exists because no free API serves
app-industry benchmarks (ARPU by vertical, retention curves, LTV:CAC).
Those live in Adjust / Liftoff / Sensor Tower reports — enterprise pricing
or ~$111/month and up.

This file is the guardrail you can open on stage and point at.

## The contract

| Rule | Meaning |
|---|---|
| 1 | Every metric carries `value`, `unit`, `confidence`, `source`. |
| 2 | `confidence` ∈ `primary` \| `secondary` \| `placeholder`. |
| 3 | **`placeholder` ⇒ `value` is `null`.** A placeholder never invents a number. |
| 4 | Non-placeholder ⇒ value present AND `source.publisher` set. |
| 5 | Percent metrics are within 0–100. |
| 6 | Every vertical in `taxonomy.json` has a file. |

Enforced by `validate_benchmarks.py`. Wire it into CI — it exits 1 on violation.

## Confidence tiers

- **`primary`** — read directly from the publisher's own report/page. *(none yet)*
- **`secondary`** — a real published figure reached via a summary that cites the
  primary vendor. Usable, but verify before quoting in a graded deliverable.
- **`placeholder`** — not yet sourced. `value` is `null`. The app renders
  **"unvalidated"** and the LLM is forbidden from asserting a figure.

## Current coverage — read this before demoing

**43 of 194 vertical metrics sourced across 16 verticals (up from 7).
21 of 23 cross-vertical metrics sourced. No vertical is empty.**

That is deliberate. Seeding 137 invented numbers to make the files look
complete would reproduce exactly the hallucination failure biz2code exists
to prevent.

See `DATA_SOURCES.md` for the full catalogue of sources, tiers and future additions.

### ⚠️ The demo vertical uses PROXY data

`navigation_local` — indoor navigation, your seed project — has **no
navigation-specific published benchmarks**. Its two figures are borrowed from
the adjacent Travel & Local / utilities band and are flagged `PROXY` in the
JSON. Every other metric renders as *unvalidated*.

This is worth saying out loud on stage: the app declares where a number came
from and refuses to dress a proxy up as a measurement. That is the pitch,
demonstrated live.

### ⚠️ Two metrics have conflicting sources

Fintech D30 (published 2%–12%) and Social D30 (published 5%–22%). Both carry a
`conflicts` array listing every reported value and its origin. The generated
documents must surface the disagreement rather than silently pick one.

## Deliberately excluded

Two figures in the original template are **rules of thumb, not measured
benchmarks**, and are left as placeholders rather than asserted:

- **LTV:CAC 3:1** — a widely repeated heuristic. No measurement behind it.
- **Tech debt at 30% of dev effort** — likewise.

Source them or leave them unvalidated. Do not let the LLM state them as fact.

## Live APIs (complement, not replacement)

| API | Auth | Covers | Constraint |
|---|---|---|---|
| World Bank Indicators v2 | none | TAM/SAM/SOM grounding, population, GDP, urbanisation, internet penetration | ~16,000 indicators; CC-BY, attribution required |
| Apple iTunes Search | none | Competitor discovery, pricing, ratings, category | ~20 calls/min; **no CORS — server-side only** |

Neither covers monetisation benchmarks. That gap is why this file exists.

## Paid APIs — future work

Not used in the MVP (cost, and out of scope for a one-week build). Candidates
if the project continues: Sensor Tower, data.ai, Adjust, Liftoff, Statista,
SimilarWeb, Crunchbase. Each would replace a block of placeholders with
`primary`-tier values.

## Maintenance

1. Find a figure in a report you trust.
2. Set `value`, set `confidence` to `primary`/`secondary`, fill `source`.
3. Update `lastReviewed`.
4. Run `python3 validate_benchmarks.py`.

Benchmarks age fast — one vertical in the seed data was reported as declining
sharply year over year. Re-check `lastReviewed` before every serious use.
