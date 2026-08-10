# biz2code — System Architecture

**Status:** Design, pre-build · **Date:** 2026-08-10 · **Build window:** 1 week

Two frontend variants are specified. **Build one.** The backend is identical in both.

---

## 1. Constraints that shaped every decision

| Constraint | Consequence |
|---|---|
| One week, one developer | Monolith; no containers; no CI/CD (ADR-001, ADR-002) |
| Learning React + TypeScript during the build | Fewest new tools possible; raw SQL over an ORM (ADR-004) |
| Local-only, DOCX downloaded to disk | No cloud storage, no public URL (ADR-002) |
| Single user, no roles | No tenant isolation surface (ADR-005) |
| Thesis: LLMs can't infer what analysis an idea needs | Fixed questions; guardrailed citation (ADR-003, ADR-009) |
| Graded on both the app *and* its documents | Output quality is a first-class requirement |

---

## 2. System context

```
┌─────────────┐   REST/JSON    ┌──────────────────────────┐      ┌────────────┐
│  React SPA  │ ─────────────▶ │   Express API (TS)       │ ───▶ │ PostgreSQL │
│ (Vite, TS)  │ ◀───────────── │                          │      └────────────┘
└─────────────┘   httpOnly     │  ├ gate state machine    │
                  JWT cookie   │  ├ calculation layer     │      ┌────────────┐
                               │  ├ generation pipeline   │ ───▶ │ ./outputs  │
                               │  └ provenance ledger     │      │  *.docx    │
                               └───────┬──────────────────┘      └────────────┘
                                       │ server-side only
                        ┌──────────────┼──────────────┐
                        ▼              ▼              ▼
                   Groq (LLM)   World Bank API   iTunes Search
                   Gemini f/b     (keyless)      (keyless, no CORS)
```

**Everything external is server-side.** The browser never holds an API key, and iTunes
sends no CORS headers, so a browser call would fail regardless.

---

## 3. Request flow — the gate

```
answer question ──▶ POST /api/projects/:id/answers
                          │
                          ▼
                   validate against question-bank.json
                          │
                          ▼
                   UPSERT answers  (unique on project_id+question_id)
                          │
                          ▼
              all required questions in phase answered?
                    │ no                        │ yes
                    ▼                           ▼
            phase: in_progress          phase: awaiting_approval
                                                │
                          ┌─────────────────────┴──────────────┐
                          ▼ approve                            ▼ revise
              phase: approved, approved_at=now()      phase: revising
              current_phase += 1 (if < 4)             (edit individual answers)
                          │
                          ▼
              phase 4 approved ──▶ generation pipeline
```

**The gate is one invariant:** `current_phase` may only advance when the current phase's
status is `approved`, and a phase may only reach `approved` when every required question
has an answer. Everything else is UI around that rule.

---

## 4. Generation pipeline

Runs once, after phase 4 is approved. Order matters (ADR-010).

```
collect answers ──▶ calculation layer ──▶ resolve benchmarks ──▶ fetch APIs (cached)
                                                                        │
                            ┌───────────────────────────────────────────┘
                            ▼
                    build guardrailed context
                    { answers, computed, benchmarks, apiData, allowedCitations }
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
           MRD  ────────▶ PRD ────────▶ Business Plan
          (v1)           (v1)          (needs MRD+PRD for
                                        product_weaknesses)
              │             │             │
              └─────────────┴─────────────┘
                            ▼
              render DOCX ──▶ ./outputs/<project>/MRD_v1.docx
                            ▶ store row in deliverables (+ provenance, unvalidated)
```

**Failure handling:** if the LLM returns malformed JSON for a section, that section is
marked `unavailable — malformed model output` and the rest of the document still renders.
A failed API call falls through to the benchmarks file; a missing benchmark renders
`unvalidated`. Nothing aborts the pipeline.

---

## 5. Backend structure (identical in both variants)

Conventional layered separation. FSD does not apply here (ADR-012).

```
server/
├── index.ts                    # bootstrap, listen
├── app.ts                      # express app, middleware chain
├── config/
│   ├── env.ts                  # typed env loading, fails fast on missing keys
│   └── constants.ts
├── middleware/
│   ├── auth.ts                 # verifies JWT from httpOnly cookie
│   ├── validate.ts             # request-body validation
│   └── error.ts                # single error handler, last in chain
├── routes/                     # HTTP shape only — no logic
│   ├── auth.routes.ts
│   ├── project.routes.ts
│   ├── answer.routes.ts
│   ├── phase.routes.ts
│   └── document.routes.ts
├── controllers/                # parse request → call service → shape response
│   └── *.controller.ts
├── services/                   # ALL business logic lives here
│   ├── auth.service.ts
│   ├── project.service.ts
│   ├── gate.service.ts         # ★ the state machine
│   ├── calculation.service.ts  # ★ 11 deterministic formulas
│   ├── generation.service.ts   # ★ orchestrates MRD→PRD→BP
│   ├── llm.service.ts          # Groq client, JSON-mode, retry, Gemini fallback
│   ├── benchmark.service.ts    # loads + resolves benchmarks/*.json
│   ├── external.service.ts     # World Bank + iTunes, with DB cache
│   └── docx.service.ts         # renders sections → .docx
├── db/
│   ├── pool.ts                 # pg Pool
│   ├── query.ts                # ~30-line typed wrapper (ADR-004)
│   └── migrations/001_init.sql
├── data/                       # authored content, validated in CI (ADR-006)
│   ├── question-bank.json
│   ├── seed-project.json
│   └── benchmarks/*.json
└── types/
```

**Dependency rule:** routes → controllers → services → db. Never upward, never sideways
between services except through explicit imports. `gate.service` is the only module
permitted to mutate `phases.status` or `projects.current_phase`.

---

## 6. Frontend — Variant A (conventional)

Fastest to build. Recommended if the week gets tight.

```
src/
├── main.tsx
├── App.tsx                     # router + providers
├── pages/
│   ├── LoginPage.tsx
│   ├── ProjectsPage.tsx        # list + "New project" (demo reset)
│   ├── PhasePage.tsx           # ★ the gate UI
│   └── DocumentsPage.tsx       # generated docs + download
├── components/
│   ├── QuestionField.tsx       # text | select | multiselect | number
│   ├── PhaseStepper.tsx
│   ├── ApprovalGate.tsx
│   ├── UnvalidatedBadge.tsx    # ★ renders the guardrail visibly
│   └── ui/
├── hooks/                      # React Query wrappers
│   ├── useProject.ts
│   ├── useAnswers.ts
│   └── useDocuments.ts
├── lib/
│   ├── api.ts                  # fetch client, credentials: 'include'
│   └── types.ts
└── context/AuthContext.tsx
```

State: React Query for server state, Context for auth, `useState` locally. No Redux.

---

## 7. Frontend — Variant B (Feature-Sliced Design)

More structure to demonstrate; slightly more overhead. Layers per the FSD spec, which
notes most projects need at least Shared, Pages and App.

**Widgets is deliberately unused** — the current spec discourages it. **Processes is
deprecated** and unused.

```
src/
├── app/                        # app-wide concerns
│   ├── entrypoint/main.tsx
│   ├── routes/router.tsx
│   ├── providers/              # QueryClient, AuthProvider
│   └── styles/index.css
├── pages/                      # one slice per screen
│   ├── login/
│   ├── projects/
│   ├── phase/                  # ★ composes the gate feature
│   └── documents/
│       ├── ui/
│       ├── api/
│       └── index.ts            # public API — the ONLY import surface
├── features/                   # user interactions reused across pages
│   ├── answer-question/
│   ├── approve-phase/          # ★ the gate interaction
│   ├── generate-documents/
│   ├── download-document/
│   └── auth-session/
├── entities/                   # business nouns
│   ├── project/{model,api,ui}
│   ├── phase/
│   ├── question/
│   ├── answer/
│   └── deliverable/
└── shared/                     # no business domain
    ├── api/                    # base client
    ├── ui/                     # buttons, inputs, badges
    ├── lib/                    # focused libraries, each with a README
    ├── config/
    └── routes/
```

**Import rule:** a slice may only import from layers strictly below it. `app` and
`shared` are exceptions — they are layer and slice at once, so their segments may import
each other freely.

Entity cross-references use the `@x` notation rather than direct reaching:
`entities/answer/@x/question.ts` re-exports the `Question` type for `answer` to consume.

**Steiger runs in warn-only mode** (ADR-012): violations surface in the terminal but never
block a build. Under a one-week deadline, a linter that halts the build is a liability.

---

## 8. Variant comparison

| | A — Conventional | B — FSD |
|---|---|---|
| Setup cost | ~0 | ~2–3 hours |
| Files | ~37 | ~55 |
| Learning curve while learning React | Low | Medium |
| Structural discipline demonstrated | Low | High |
| Risk under deadline | Low | Medium |

**Recommendation: build Variant A, document Variant B.** You're learning React during a
one-week build; FSD's import discipline is a real cognitive cost at exactly the wrong
moment. Variant B is fully specified here, so it can be presented as considered
architecture — and migrated to later, which FSD explicitly supports doing incrementally.

If the goal is to *show* architectural sophistication to an assessor, the ADR set does
that more cheaply than the folder structure does.

---

## 9. Cross-cutting

**Provenance ledger.** Every generated field records where it came from: which answers,
which benchmark entries (with confidence tier), which API responses. This populates the
`Data Sources` field the template requires in all three documents, and it is what makes
the guardrail demonstrable rather than merely claimed.

**Unvalidated rendering.** A field whose inputs include a placeholder benchmark, a failed
API call, or malformed model output renders `unvalidated` with a reason. 43 of 194
vertical benchmark metrics are currently sourced — expect this badge to appear often, and
say so on stage.

**Conflict surfacing.** Where published sources disagree (fintech D30 retention: 2%–12%;
social: 5%–22%), the document reports the disagreement and its sources rather than
silently choosing one.

**Caching.** World Bank and iTunes responses are cached in `external_cache`. The seed
project ships pre-cached so the demo does not depend on network conditions.

**Testing.** Vitest, unit-only. Priority order: calculation layer (pure functions, highest
value), gate state machine (the core invariant), benchmark resolution including the
unvalidated path, then LLM response parsing with a malformed-input case.
