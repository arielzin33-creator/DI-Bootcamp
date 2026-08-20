# Web Research Briefing

An HTTP server exposing search + fetch + summarize + save as JSON tools, and a CLI (`brief`)
that chains them into a saved Markdown briefing with citations.

## Setup

```bash
npm install
cp .env.example .env    # edit MCP_HTTP_TOKEN; add TAVILY_API_KEY for real search (optional)
npm run build
npm start                # http://localhost:8787
```

In a second terminal:

```bash
MCP_HTTP_TOKEN=<your token> npm run brief -- "your topic"
```

**A real, verified environment quirk worth knowing:** `tsx` (used by `npm run dev` and
`npm run brief`) dies silently and immediately when run as a background process in some
environments -- confirmed directly while building this: identical commands worked perfectly in
the foreground and failed with zero log output the instant they were backgrounded, regardless of
whether `tsx` was invoked via `npx` or its binary directly. Plain `node` on compiled output
(`npm run build && npm start`) does not have this problem. If `npm run dev` seems to vanish with
no error, that's likely what's happening -- run the server in its own foreground terminal, or use
the built version.

## What's real vs. mocked, and why

This project was built and verified without a Tavily API key and without a reachable local LLM
-- Ollama could not even be installed in the build environment (its install script returned a
503 through the network layer there). Rather than ship untested code for those two pieces, both
have a documented mock fallback (`MOCK_MODE=true`, which is also the default whenever
`TAVILY_API_KEY` is unset), and everything else is exercised for real.

**Verified for real, against a live running server:**
- `GET /tools` -- returns all 4 tool schemas.
- Auth: missing header -> 401, wrong token -> 401, correct token -> passes through.
- Input validation: empty `query` -> 400 with a clear Zod-derived message; invalid `url` -> 400.
- **`fetch_readable` against a real page** (`https://en.wikipedia.org/wiki/Web_scraping`) --
  genuinely fetched and extracted via Mozilla's Readability, no API key needed for this one.
- `save_markdown`: successful write, and a path-traversal attempt (`filename:
  "../../etc/evil.md"`) correctly rejected with 400 rather than written.
- **The full CLI pipeline end to end**, including its error-handling path: two of the three mock
  search results point at `example.com`/`example.org` URLs that don't exist, so those
  `fetch_readable` calls genuinely 404 -- the CLI catches each failure, warns, and continues
  rather than crashing, then summarizes and saves using just the one document that *did* fetch
  successfully (a real Wikipedia page). `outputs/brief_2026-08-02.md`, included in this
  submission, is the actual file that run produced -- not composed by hand.

**Implemented against verified current API docs, but not exercised against the live service:**
- `search_web`'s real Tavily integration -- endpoint, auth header shape (`Authorization: Bearer`,
  not the older `x-api-key`/body-embedded-key patterns some older tutorials show), and response
  shape all checked against Tavily's current docs, not assumed from training data. Not run
  against a real key.
- `summarize_with_citations`'s real Ollama integration -- `/api/chat` request/response shape
  checked against current docs, including the JSON-repair-and-retry-at-lower-temperature behavior
  the exercise's own troubleshooting section anticipates. Not run against a real Ollama instance.

## A real bug, caught only by running the CLI against genuinely mixed results

The first version of the mock summarizer indexed documents by `i % docs.length` but always took
each document's *first* sentence regardless of `i` -- fine when multiple documents succeed, but
with only one document actually fetched (exactly what happened in the real CLI run above, since
two of three mock URLs correctly 404), it produced the same bullet five times over. Fixed by
splitting each document into sentences up front and cycling through *those* per bullet too, not
just cycling through documents. Confirmed by re-running the same CLI command: five genuinely
different bullets, each drawn from a different part of the one real fetched Wikipedia page.

## A second real bug, caught by deliberately trying to break `save_markdown`

A path-traversal attempt (`filename: "../../etc/evil.md"`) was correctly *rejected* by the first
version's validation, but came back as an HTTP `500` -- the code threw a plain `Error`, which the
generic error handler couldn't distinguish from an actual server-side failure. Fixed by throwing
a dedicated `BadRequestError` instead, so a correctly-rejected bad request now returns `400` (the
client's request was invalid) rather than `500` (implying this server broke).

## Choices worth explaining

**TypeScript 7.0.2, checked directly rather than assumed to still be the 5.x line** most
TypeScript tutorials and this project's own initial instinct would expect -- a genuinely new major
version (the Go-based compiler rewrite). Verified it compiles this project's code correctly
before writing anything substantial against it.

**Zod v4's `z.url()`, not `.string().url()`.** Checked directly by running a throwaway validation
script before committing to the pattern throughout `src/lib/schemas.ts` -- v4 moved format
validators like URL/email to top-level functions.

**`GET /tools` is the one endpoint not behind Bearer auth.** It's a capability listing, not an
action -- there's nothing in it a caller couldn't already infer by reading this repository's
source, so gating *discovery* behind the same auth as *execution* wouldn't add real protection,
just friction.

**The CLI fetches from distinct domains, not just the first 3 search results.** Several results
from the same site would waste fetches on redundant content rather than actually diversifying
what the summary draws from.

## Endpoints

| Method | Path | Auth |
|---|---|---|
| GET | `/health` | no |
| GET | `/tools` | no |
| POST | `/tools/search_web` | Bearer |
| POST | `/tools/fetch_readable` | Bearer |
| POST | `/tools/summarize_with_citations` | Bearer |
| POST | `/tools/save_markdown` | Bearer |

See `curl_examples.md` and `postman_collection.json` for runnable examples of every one of them,
including the auth/validation failure cases.

## Free tools this targets

- **Search:** [Tavily](https://docs.tavily.com/) -- simplest free setup, per the exercise's own tip.
- **LLM:** [Ollama](https://ollama.com), `llama3` via `/api/chat`.

## Troubleshooting (from the exercise, plus the two real findings above)

- `401 Unauthorized` -> check `Authorization: Bearer <MCP_HTTP_TOKEN>` matches your `.env`.
- Search `403`/`401` -> your `TAVILY_API_KEY` is missing or invalid; falls back to mock data if
  `MOCK_MODE=true` or the key is unset entirely.
- LLM JSON parse failures -> `summarize.ts`'s `extractJSON` + one retry at `temperature: 0.1`
  handles this automatically; if both attempts fail, the error message says so explicitly rather
  than returning malformed data.
- Readability returns empty text -> `fetch_readable` returns `text: ""` rather than throwing, so
  the CLI can skip that source and continue (see the real CLI run above for this exact path).
- `tsx` in the background produces no output at all -> see the environment note near the top of
  this README.
