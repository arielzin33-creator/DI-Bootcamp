# biz2code

A Linear Gatekeeper for business-validated development. Answer four gated phases about a
software idea; the app generates an MRD, a PRD and a Business Plan as DOCX files.

## Why it exists

General-purpose LLMs cannot reliably infer which analysis a given business idea needs —
what this project calls **AI blind spots**. biz2code constrains the model into a fixed,
human-approved sequence, and permits it to cite only a curated benchmark file and two
keyless public APIs. Anything it cannot source renders **unvalidated** rather than invented.

## Stack

React + TypeScript (Vite) · Node + Express + TypeScript · PostgreSQL (raw `pg`) ·
Groq (Gemini fallback) · Vitest

## Run locally

```bash
createdb biz2code
psql biz2code -f server/db/migrations/001_init.sql
cp .env.example .env          # add GROQ_API_KEY, JWT_SECRET, DATABASE_URL
npm install
npm run dev                   # api :3001, client :5173
```

## Layout

```
server/           routes -> controllers -> services -> db
data/             question-bank.json, seed-project.json, benchmarks/*.json  <- authored content, validated in CI
client/           pages + components + hooks
docs/             ARCHITECTURE.md, WORK_PLAN.md, adr/
```

## The gate

`gate.service.ts` is the only module permitted to mutate `phases.status` or
`projects.current_phase`. One invariant: a phase reaches `approved` only when every
required question is answered, and `current_phase` advances only from an approved phase.

## Guardrail

`data/benchmarks/` is the allow-list. 43 of 194 vertical metrics are currently
sourced; the rest render unvalidated by design. Run
`python3 data/benchmarks/validate_benchmarks.py` to enforce the honesty contract —
placeholders may never carry a number.

## Docs

- `docs/ARCHITECTURE.md` — system design, both frontend variants
- `docs/WORK_PLAN.md` — day-by-day build plan and cut list
- `docs/adr/` — 12 architecture decision records
