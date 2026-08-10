# File Index

Every file's purpose at a glance. Full rationale sits in the header of each file.


## Root

| File | Purpose |
|---|---|
| `.env.example` | — |
| `README.md` | — |

## `client/`

| File | Purpose |
|---|---|
| `client/src/App.tsx` | Router and route guards. |
| `client/src/components/ApprovalGate.tsx` | Approve / Revise controls at the foot of a phase. |
| `client/src/components/PhaseStepper.tsx` | Shows the four phases and the current position. |
| `client/src/components/QuestionField.tsx` | Renders one question by its type: text \| select \| multiselect \| number. |
| `client/src/components/UnvalidatedBadge.tsx` | ★ Renders the guardrail visibly wherever a figure could not be sourced. |
| `client/src/context/AuthContext.tsx` | Holds the current user; exposes login/logout. |
| `client/src/hooks/useAnswers.ts` | Answer fetch + autosave mutation |
| `client/src/hooks/useDocuments.ts` | Generated document list and download |
| `client/src/hooks/usePhase.ts` | Phase status, approve, revise |
| `client/src/hooks/useProject.ts` | Project queries and mutations |
| `client/src/lib/api.ts` | Fetch wrapper. ALWAYS sends credentials. |
| `client/src/lib/types.ts` | Shared response types mirroring the API. |
| `client/src/main.tsx` | React entry point. Mounts providers. |
| `client/src/pages/DocumentsPage.tsx` | Generated documents: list, versions, download. |
| `client/src/pages/LoginPage.tsx` | Login and register. |
| `client/src/pages/PhasePage.tsx` | ★ The main screen. Renders a phase's questions and its gate. |
| `client/src/pages/ProjectsPage.tsx` | Project list plus the New Project button. |

## `server/`

| File | Purpose |
|---|---|
| `server/app.ts` | Builds the Express app: middleware chain and route mounting. |
| `server/config/env.ts` | Loads and validates environment variables once, at boot. |
| `server/controllers/answer.controller.ts` | Parses requests and shapes responses for answer routes. |
| `server/controllers/auth.controller.ts` | Parses requests and shapes responses for auth routes. |
| `server/controllers/document.controller.ts` | Parses requests and shapes responses for document routes. |
| `server/controllers/phase.controller.ts` | Parses requests and shapes responses for phase routes. |
| `server/controllers/project.controller.ts` | Parses requests and shapes responses for project routes. |
| `server/db/pool.ts` | The single pg connection pool. |
| `server/db/query.ts` | Thin typed wrapper over pg. ~30 lines, by design. |
| `server/index.ts` | Process entry point. Starts the HTTP listener. |
| `server/middleware/auth.ts` | Verifies the JWT from the httpOnly cookie and attaches req.userId. |
| `server/middleware/error.ts` | Single error handler. Last in the middleware chain. |
| `server/middleware/validate.ts` | Validates request bodies against the question bank / simple shape checks. |
| `server/routes/answer.routes.ts` | HTTP surface: GET/POST /projects/:id/answers |
| `server/routes/auth.routes.ts` | HTTP surface: POST /register, POST /login, POST /logout, GET /me |
| `server/routes/document.routes.ts` | HTTP surface: POST /projects/:id/generate, GET /documents, GET /documents/:id/download |
| `server/routes/phase.routes.ts` | HTTP surface: POST /projects/:id/phases/:n/approve, /revise |
| `server/routes/project.routes.ts` | HTTP surface: GET /projects, POST /projects, GET /projects/:id |
| `server/services/answer.service.ts` | Upserts answers, typed by question kind. |
| `server/services/auth.service.ts` | Register, login, token issuance. |
| `server/services/benchmark.service.ts` | Loads benchmarks/*.json, resolves a metric for a vertical, falls back cross-vertical. |
| `server/services/calculation.service.ts` | ★ Deterministic economics. 11 formulas. The LLM never does arithmetic. |
| `server/services/docx.service.ts` | Renders generated sections into MRD_v1.docx / PRD_v1.docx / BusinessPlan_v1.docx. |
| `server/services/external.service.ts` | World Bank + iTunes clients, cached in external_cache. |
| `server/services/gate.service.ts` | ★ THE GATE. The only module allowed to mutate phases.status or projects.current_phase. |
| `server/services/generation.service.ts` | Orchestrates MRD -> PRD -> Business Plan, then renders DOCX. |
| `server/services/llm.service.ts` | Groq client. JSON mode, one retry, Gemini fallback, hard timeout. |
| `server/services/project.service.ts` | Create / list projects; loads the seed project. |
| `server/services/questionBank.service.ts` | Loads and indexes question-bank.json. |
