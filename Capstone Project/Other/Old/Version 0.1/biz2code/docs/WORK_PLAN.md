# biz2code — One-Week Work Plan

**Assumption stated plainly:** React and TypeScript are being learned during this build.
Every estimate below carries that. If a day slips, cut from Day 6, never from Day 7.

---

## Day 0 — before the clock starts (2–3 hrs, evening)

- [ ] Groq account + API key; confirm the free tier covers the build
- [ ] Confirm the largest model that returns clean JSON in <30 s; record the model ID
- [ ] Postgres running locally; `psql` connects
- [ ] `npm create vite@latest` scaffold; confirm it runs
- [ ] Paste `benchmarks/`, `question-bank.json` into `server/data/`

*Front-loading environment setup protects Day 1. Setup failures are the most common
way a one-week build loses a day.*

---

## Day 1 — Backend foundation

**Ships:** register + login work in Postman; DB has tables.

- Express + TS bootstrap, env config, error middleware
- `001_init.sql`, applied; `pool.ts` + typed `query.ts` wrapper
- `auth.service` — bcrypt, JWT, httpOnly cookie
- `auth.routes` + `auth.controller`
- **Checkpoint:** register → login → cookie set → protected route returns 200

---

## Day 2 — The gate ★

**Ships:** the whole state machine, working, via HTTP.

- `project.service` — create, list, seed-project loading
- `question-bank` loader + validator (fails fast on a malformed bank)
- `answer.service` — upsert, typed by question kind
- **`gate.service`** — the invariant: phase completeness, approve, revise, advance
- Routes for projects / answers / phases
- **Vitest: gate state machine.** Cannot approve an incomplete phase; cannot skip a
  phase; revise returns to the same phase
- **Checkpoint:** a full 4-phase run, approved end-to-end, in Postman

*This is the highest-risk day and the actual product. Protect it.*

---

## Day 3 — Numbers and sources

**Ships:** computed economics, benchmark resolution, live APIs.

- **`calculation.service`** — 11 formulas, null-on-placeholder, no NaN/Infinity
- **Vitest: calculation layer.** Division by zero, missing benchmark, confidence inheritance
- `benchmark.service` — vertical lookup, cross-vertical fallback, conflict surfacing
- `external.service` — World Bank + iTunes, `external_cache`, graceful failure
- **Checkpoint:** given the seed answers, correct numbers and correct `unvalidated` flags

---

## Day 4 — Generation

**Ships:** three DOCX files on disk.

- `llm.service` — Groq client, JSON mode, one retry, Gemini fallback, timeout
- Prompt templates per document, with the allow-list of citable sources
- `generation.service` — MRD → PRD → Business Plan, provenance ledger
- `docx.service` — render sections, placeholder branding, version footer
- Malformed-output path: mark the section unavailable, keep going
- **Checkpoint:** `MRD_v1.docx`, `PRD_v1.docx`, `BusinessPlan_v1.docx` open cleanly

---

## Day 5 — Frontend

**Ships:** the app is usable in a browser.

- Vite + router + React Query + AuthContext
- Login, Projects (with **New project** for demo reset)
- **PhasePage** — question rendering by type, stepper, approval gate
- DocumentsPage — list, download, `UnvalidatedBadge`
- **Checkpoint:** complete a project start to finish without touching Postman

*One day for the whole frontend is aggressive while learning React. If Day 5 overruns,
drop styling — not the gate UI.*

---

## Day 6 — Harden

- Remaining unit tests; fix what they surface
- Loading and error states (generation takes ~30 s per document — the UI must say so)
- Seed project pre-cached; clear the 5 demo answers
- **Full dress rehearsal on the demo laptop**
- README, code comments (the brief calls these out explicitly)

---

## Day 7 — Buffer ★

**Do not plan work here.** This day is what converts "tight but feasible" into
"delivered."

If Day 7 is genuinely free: record the 2:30 video, build the slides, write the Medium
article.

---

## Cut list, in order

If you fall behind, cut in this order and stop when you're back on schedule:

1. Styling polish → plain but legible
2. Variant B (FSD) → build Variant A
3. iTunes API → benchmarks file only
4. World Bank API → benchmarks file only
5. Feedback-loop scaffold → silent only
6. DOCX polish → Markdown output, convert manually

**Never cut:** the gate, the calculation layer, the unvalidated badge, Day 7.

---

## What "done" looks like

- [ ] Login, create a project, answer 4 phases, approve each gate
- [ ] Revise an answer; regenerate; v2 appears alongside v1
- [ ] Three DOCX files download and open
- [ ] `unvalidated` appears where data is missing — visibly, not silently
- [ ] Numbers are reproducible across runs
- [ ] Unit tests pass
- [ ] Repo has branches and comments
