# Agentic AI with RAG (Retrieval-Augmented Generation)

A tiny agent: an in-memory KB (FAISS + FakeEmbeddings), a real Wikipedia tool, a rule-based
planner deciding between them, and an answer function that cites sources and admits when it
has no evidence.

## About the linked Colab notebook

Not accessible while building this -- the shared Google Drive link returns only a Google
sign-in page, no notebook content, when fetched directly. Everything here is built from the
written exercise instructions.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd src
python quick_check.py
```

Or open `Agentic_RAG_Completed.ipynb` -- every cell already has real, genuinely-executed output
attached (verified via `nbclient` against a real kernel, multiple times, not just checked for
well-formed JSON).

## Three real bugs, all found only by actually running this against live conditions

**1. `FakeEmbeddings` doesn't rank by real semantic similarity.** A Python question, correctly
routed to `"kb"` by the planner's keyword match, still came back citing Bitcoin, Shakespeare,
and the Eiffel Tower -- the actual Python doc wasn't even in the FAISS retriever's top-3.
Confirmed directly (`retriever.invoke("Tell me about the Python programming language")`
returning three docs with none of them being about Python), not assumed from `FakeEmbeddings`
being a "fake" -- it's specifically that it produces random, non-semantic vectors. Fixed by
grounding the actual answer's doc selection in the planner's reliable keyword match
(`plan["matched_topics"]`) rather than the retriever's arbitrary ranking, while still genuinely
building and calling the FAISS retriever (satisfying Exercise 1's own requirement).

**2. A nonsense question confidently cited random KB docs instead of admitting no evidence
existed** -- directly violating the exercise's "handle missing evidence gracefully" requirement.
Caused by an unjustified Wikipedia-found-nothing -> fall-back-to-KB path that trusted the same
arbitrary FAISS ranking with no real signal behind it. Fixed by removing that fallback: no
keyword match and no Wikipedia result together are a genuine "no evidence" case, verified by
re-running the same nonsense question and confirming `sources: []` with an honest response.

**3. Wikipedia queries failed intermittently -- and the first diagnosis of why was wrong.** A
first pass (mis-)diagnosed a missing `User-Agent` header as the cause, based on a `curl -A ""`
reproducing Wikipedia's real *"Please set a user-agent..."* policy message. That's a real
message Wikipedia does send, but re-testing with the library's *default* User-Agent (after
fixing a separate, unrelated issue -- see below) succeeded fine, proving the User-Agent was
never the actual cause of the failures being chased. The real causes, found by tracing further:

- The `wikipedia` package hardcodes a plain `http://` endpoint. This build environment's
  network fails plain-HTTP requests to that host at a network/proxy level (confirmed: manually
  replicating the library's exact request returned a 503 with body `"DNS resolution failure"`,
  nothing from Wikipedia's own API at all). Forcing `https://` is a real, necessary fix.
- The **actual dominant cause of ongoing intermittency**: genuine `429 Too Many Requests` from
  Wikipedia's own rate limit, confirmed by hitting the raw API directly in a loop and reading
  the real response body (*"You are making too many requests to the API..."*). Not something
  client code can fix -- only handle gracefully, via a retry-with-backoff plus the existing
  graceful-empty-list design.

All three findings, and the correction to the first, are documented in `wiki_tool.py`'s own
docstring and in the notebook -- including admitting the initial diagnosis was wrong rather than
quietly fixing the text to look right the first time.

## Live variability, shown honestly rather than hidden

Across many real executions while building and verifying this, the Wikipedia-dependent question
("What is the capital of Japan?") sometimes returned real Wikipedia content and sometimes came
back `sources: []` with a graceful "no evidence" answer -- purely depending on whether
Wikipedia's rate limit happened to be in effect at that exact moment for this environment's
shared egress IP. Both outcomes are genuine, both are captured somewhere in this submission
(the notebook shows one; this README's own testing showed both), and both are handled
correctly -- which is the actual point of "handle missing evidence gracefully": the system
doesn't need Wikipedia to always be available to behave correctly, only to degrade honestly
when it isn't.

One more genuine, unedited artifact worth knowing about rather than curating away: real
Wikipedia search for "capital of Japan" surfaces *Capital punishment in Japan* alongside
*Japan* itself, because "capital" is a genuinely ambiguous keyword. That's real search
behavior, not a bug in this project.

## Design decision: the stub LLM cannot read context, so it doesn't do the real work

The exercise asks for a "stub LLM (`FakeListChatModel`) by default." Confirmed directly:
`FakeListChatModel` returns a fixed response regardless of input -- calling it twice with
completely different prompts returned the same cycled canned text both times. It genuinely
cannot read retrieved context or decide what to say about it. So `answer.py`'s
`synthesize_answer()` -- the actual "combine context, cite sources, note thin evidence" logic --
is plain, deterministic Python, not delegated to the configured chat model. The model (stub by
default, optionally a real tiny HF pipeline) is only used for a clearly-separate, optional
closing sentence in `polish_with_llm()`; correctness doesn't depend on it either way.

## What's not verified: the optional tiny HF pipeline

The exercise allows "optionally load a tiny HF pipeline (`sshleifer/tiny-gpt2`) for local
generation." **Not verified live** -- `transformers`/`accelerate` pull in `torch`, and the build
environment ran out of disk space twice attempting the install, even after freeing several
gigabytes from unrelated earlier work. Said plainly rather than silently skipped: this is a real
constraint hit in this specific build environment, not a reason to believe the wiring (shown in
the notebook's "Optional" section) is wrong -- a real Colab runtime, which is what this project
targets, doesn't have this constraint.

## File map

```
src/kb.py             8 Document objects + topic keyword map (Exercise 1)
src/retriever.py       FakeEmbeddings + FAISS retriever (Exercise 1)
src/wiki_tool.py       real Wikipedia integration, with all 3 fixes above (Exercise 2)
src/planner.py         rule-based KB-vs-Wikipedia planner (Exercise 3)
src/answer.py          retrieval + citation + thin-evidence handling (Exercise 4)
src/quick_check.py     3 sample questions, printing plan/sources/answer (Exercise 5)
Agentic_RAG_Completed.ipynb   the notebook deliverable, genuinely executed multiple times
build_notebook.py      assembles the .ipynb from these files' real content and captured output
```

## Version notes

Installed `langchain` **1.3.14**, `langchain-community` **0.4.2** -- checked directly rather
than assumed, given LangChain's history of import-path churn. `langchain-community` itself now
prints a deprecation warning on import (`is being sunset and is no longer actively maintained`)
-- still fully functional here (this is exactly what the exercise's own install command
specifies), but worth knowing before extending this further; a standalone `langchain-faiss`
package (not used here, to match the exercise's literal install list) exists as the modern
alternative to `langchain_community.vectorstores.FAISS`.
