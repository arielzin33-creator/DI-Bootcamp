# Project Delivery — Index

Everything produced across this project, organized into three independent folders.
Nothing in one folder depends on the others — you can zip and submit them separately.

```
.
├── biz2code/                 ← THE PROJECT. A runnable app + its full documentation.
├── AAAEE_Flowchart/          ← Earlier, separate deliverable. The AAAEE pipeline diagram.
└── GitHub_Profile_README/    ← Side task. Your GitHub profile page, not part of the app.
```

---

## `biz2code/` — start here

This is a complete, self-contained repository. If you only look at one folder, it's this
one — everything else in the project (architecture, ADRs, question bank, benchmark data,
seed project) lives *inside* it now, not scattered at the top level.

```
biz2code/
├── README.md                 Project overview, how to run it, the gate invariant
├── FILE_INDEX.md             Every file in this repo, one line each — start here to navigate
├── package.json               npm workspaces root — `npm install && npm run dev` from here
├── .env.example                Copy to .env and fill in GROQ_API_KEY etc.
│
├── client/                    React + TypeScript frontend (Variant A — see ARCHITECTURE.md)
│   └── src/{pages,components,hooks,context,lib}
│
├── server/                    Node + Express + TypeScript backend
│   ├── {routes,controllers,services,middleware,db}/
│   ├── data/                  Authored content — the guardrail, in plain sight
│   │   ├── question-bank.json      20 fixed questions, 4 phases, calculation spec
│   │   ├── seed-project.json       Pre-filled demo (indoor navigation), real API data
│   │   └── benchmarks/             16 verticals + cross-vertical fallback + validator
│   └── scripts/
│       ├── seed.ts                 Loads seed-project.json into the database
│       └── fetch-seed-data.ts      Re-fetches live World Bank / iTunes data (standalone, no DB needed)
│
└── docs/                      Everything you'd hand an instructor or a future you
    ├── ARCHITECTURE.md              System design, both frontend variants, decision rationale
    ├── WORK_PLAN.md                 Day-by-day build plan + cut list
    ├── GATED_SPECIFICATION_METHOD.md / .docx   Standalone methodology (biz2code is one example of it)
    ├── schema.sql                   The 6-table Postgres schema
    └── adr/                         12 Architecture Decision Records — every major call, with alternatives considered
```

**If you're picking this back up after a break**, read in this order:
`docs/ARCHITECTURE.md` → `docs/WORK_PLAN.md` → `FILE_INDEX.md` → start on Day 1.

**Before Demo Day:** re-run `npx tsx server/scripts/fetch-seed-data.ts` if it's been a
while — the cached World Bank/iTunes data has a date on it and can go stale.

---

## `AAAEE_Flowchart/`

An earlier, separate deliverable — an interactive n8n-style diagram of the AAAEE 7-phase
gatekeeper pipeline (not biz2code's own architecture; this predates the biz2code work).

| File | What it is |
|---|---|
| `AAAEE_Pipeline_Flowchart.html` | Standalone — open directly in any browser, no server needed |
| `AAAEE_Pipeline_Flowchart.jsx` | Same diagram as a React artifact, for use inside Claude.ai |
| `AAAEE_Pipeline_flow.json` | The underlying data — edit this to change the diagram, then regenerate |
| `AAAEE_Flowchart_Deferred_Layers_Spec.docx` | Spec for two not-yet-built diagram layers (questions layer, source-data layer) |

Unrelated to `biz2code/`'s codebase — kept separate deliberately so the two projects
don't get tangled.

---

## `GitHub_Profile_README/`

Your GitHub *profile* README (renders above your repositories on your GitHub homepage) —
distinct from `biz2code/README.md`, which is the project's own repo README.

| File | What it is |
|---|---|
| `README.md` | The profile content — copy into a repo named exactly `arielzin33-creator` |
| `SETUP.md` | How to publish it, and what was deliberately left out and why |

**Before publishing:** `SETUP.md` flags that the featured-project blurb describes
guardrail behaviour (unvalidated rendering, conflict surfacing, deterministic calculation)
that must actually be implemented in `biz2code/` first, or the profile overstates the work.

---

## What's *not* duplicated any more

Earlier in this project, `docs/`, `benchmarks/`, and `questions/` existed as loose
top-level folders *and* nested inside the app scaffold — identical content in two places.
Both copies were verified byte-identical and consolidated into the single copy now living
inside `biz2code/`. If you have an older download with those top-level folders, it's safe
to discard in favor of this structure.
