# Daily Challenge -- MCP + Airbnb

A mini-agent connecting two independent MCP servers (local notes + Airbnb, stub by default)
through one LLM/stub planner that decides which tool(s) to call and routes execution by prefix.

## About the linked Colab notebook

Not accessible while building this -- the shared Google Drive link returns only a Google
sign-in page, no notebook content, when fetched directly. Everything here is built from the
written exercise instructions, the same approach as the three companion MCP exercises in this
series (`mcp-101`, `mcp-weather`, `mcp-streaming`).

## Setup

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install "mcp[cli]" nest_asyncio openai
```

## Running it

```bash
python agent.py
```

Or open `Daily_Challenge_MCP_Airbnb_Completed.ipynb` -- every cell already has its real,
genuinely-executed output attached (verified via `nbclient` against a real Jupyter kernel, not
just checked for well-formed JSON).

## The real captured output

```
Notes tools: ['notes_add', 'notes_list']
Airbnb tools: ['airbnb_search', 'airbnb_listing_details']

Prompt: 'Find listings in Paris and note that I searched Paris.'
Proposed tool_calls: [{'name': 'airbnb_search', 'arguments': {'location': 'Paris'}},
{'name': 'notes_add', 'arguments': {'text': 'I searched Paris'}}]

airbnb_search({'location': 'Paris'}) ->
  [{'id': '1001', 'name': 'Cozy studio near the Louvre', 'price': '$95/night', 'location':
  'Paris, France'}, {'id': '1002', 'name': 'Montmartre 1BR with a view', 'price': '$120/night',
  'location': 'Paris, France'}]

notes_add({'text': 'I searched Paris'}) ->
  Saved note #1: I searched Paris
```

A second run with a different city and a compound sentence (`terminal_capture.txt` has the full
output) confirms `notes_list` and multi-tool-call planning too.

## Two real bugs, found only by actually running this against real data

**`extract_result` was silently dropping list results down to one item.** The first version read
only `result.content[0].text`, assuming a tool returning a list serializes as one JSON blob in a
single content block. Running it against `airbnb_search` (which returns two Paris listings in the
stub) showed that assumption was wrong: MCP emits **one text block per list item** --
`len(result.content) == 2` for a two-listing search -- so reading only `content[0]` silently
dropped the second listing with no error at all, just quietly wrong output. The fix:
`result.structured_content` holds the actual parsed return value already correctly assembled,
regardless of how many text blocks the representation happened to split into.

**The stub planner's note-extraction regex wasn't actually non-greedy.** Testing a compound
prompt -- "Find listings in Lisbon and note that I am planning a trip. Then list my notes." --
showed the note text capturing the entire remainder of the string, including the unrelated
second sentence. The bug: the non-greedy `.+?` was anchored directly to `$` (end of string),
which is mandatory to reach regardless of quantifier greediness -- the group still had to expand
all the way there. Fixed by stopping at the first sentence boundary instead. Both the failing and
fixed versions are shown side by side in the notebook.

## Task 3, "going real" -- both switches wired up, both currently fail, for concrete reasons

**`USE_REAL_AIRBNB=True`:** The real `@openbnb/mcp-server-airbnb` package is real and does exist
(`npm view @openbnb/mcp-server-airbnb` returns version `0.1.4`), starts cleanly on its own, and
its tool schema (`airbnb_search(location, ...)`, `airbnb_listing_details(id, ...)`) was confirmed
against the package's own published documentation before writing the stub, not guessed. But
connecting this project's MCP client to it hangs indefinitely during `session.initialize()` --
confirmed directly by wrapping the call in `asyncio.wait_for(..., timeout=15)`, which timed out
specifically at the handshake step, not before or after. The package's own `npm view` metadata
shows a dependency on `@modelcontextprotocol/sdk: ^1.0.1` -- a much older SDK than the current
spec this project's client (`mcp` 2.0.0) speaks -- which is consistent with a protocol-version
mismatch. That's stated as the leading explanation, not a confirmed root cause traced to the
wire-protocol level; I didn't go further than that, since a real fix would mean patching a
third-party package's dependency, out of scope for what the exercise explicitly allows falling
back from. `USE_REAL_AIRBNB=True` is still wired up correctly in `agent.py` -- the switch does
what it says, and what it currently says is a documented, understood failure, not a silent no-op.

**`USE_REAL_LLM=True` + `GITHUB_TOKEN`:** GitHub Models is fully retired as of July 30, 2026,
confirmed directly via GitHub's own changelog -- the same finding, confirmed the same way (a real
call from this exact code reaching the live endpoint and getting back a structured retirement
error), as the companion "MCP client with an LLM" exercise in this series. This switch has no
working "real" option anymore regardless of token validity.

## Same `mcp` version note as every other MCP exercise in this series

Installed `mcp`: **2.0.0**. `FastMCP` is `MCPServer`, imported from `mcp.server.mcpserver` -- no
backward-compatible alias anywhere in the installed package.

## File map

```
notes_server.py               notes_add, notes_list (local, always real)
airbnb_stub_server.py          airbnb_search, airbnb_listing_details (stub, mirrors real schema)
llm_planner.py                 convert_to_llm_tool, stub_plan, real_plan, propose_tool_calls
config.py                      MCP_HTTP_TOKEN (unused, see below), USE_REAL_AIRBNB, USE_REAL_LLM
agent.py                       the orchestrator -- connects both servers, plans, routes, executes
Daily_Challenge_MCP_Airbnb_Completed.ipynb   the notebook deliverable, genuinely executed
terminal_capture.txt           real captured output of two separate agent.py runs
build_notebook.py              assembles the .ipynb from these files' real content
```

## Decisions worth explaining

**`MCP_HTTP_TOKEN` is read but genuinely unused.** Both MCP servers here run over STDIO, not
HTTP -- a spawned subprocess with private pipes has no network-facing endpoint for a bearer token
to protect. `config.py` says this directly rather than wiring the token in for no real purpose
just to look like it's being used. It would matter for the companion "HTTP / Streamable HTTP in
MCP" exercise's transport, which is exactly where a token like this gets checked.

**My own notes tools are named `notes_add` / `notes_list`, not `add_note` / `list_notes`.** The
exercise's own wording uses the latter, but the whole design here depends on routing a planned
tool_call to the right server by checking its name's *prefix* -- and the real Airbnb server's own
tools are already naturally prefixed `airbnb_`. Matching that convention (`notes_` vs `airbnb_`)
is what makes the prefix-routing logic in `agent.py` actually work; `add_note`/`list_notes` would
have no shared prefix to route on at all.

**The Airbnb stub only implements `location` for `airbnb_search`**, not the full set of optional
filters the real server accepts (`checkin`, `checkout`, `minPrice`, etc.). Enough to exercise the
same tool name and required argument the real server uses -- proving the routing and planning
logic work end to end -- not a full re-implementation of Airbnb's search filtering.

## What's stubbed rather than built out

Real Airbnb search and real LLM planning are both wired up and both currently fail for the
concrete, investigated reasons above -- not because the code doesn't try. Neither the real
Airbnb server nor GitHub Models being unavailable in this environment is something a code change
here could fix.
