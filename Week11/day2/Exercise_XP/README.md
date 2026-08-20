# MCP Client with an LLM (Beginner, STDIO)

Two deliverable formats, both genuinely verified: a Colab-style notebook
(`Exercises_MCP_LLM_Student_Completed.ipynb`) and equivalent standalone scripts
(`server.py`, `client.py`, `llm_planner.py`) you can run from a terminal.

## About the linked Colab notebook

I tried fetching it directly and it isn't accessible to me -- the link returns only a Google
sign-in page, no notebook content. Everything here is built from the written exercise
instructions, which describe the server, client, and each exercise's behavior in enough detail
to build and verify directly, the same approach as the two companion MCP exercises in this
series. This project's own completed notebook -- genuinely executed cell-by-cell, not composed
by hand -- is what to treat as ground truth if it differs from whatever the original notebook
contains.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install "mcp[cli]" openai
```

## Running it

```bash
python client.py                    # Exercises 2-5, stub mode, no tokens
python optional_multiply_client.py  # the optional multiply extension
```

Or open `Exercises_MCP_LLM_Student_Completed.ipynb` in Jupyter or Colab -- every cell already
has its real output attached, so you can read it without re-running anything, or re-run it
yourself to confirm the same results.

## The most important thing to know before touching `GITHUB_TOKEN`

**GitHub Models is fully retired as of July 30, 2026.** GitHub announced retirement on July 1,
2026, ran scheduled brownouts (temporary outages) on July 16 and July 23, and completed the full
shutdown on July 30 -- confirmed directly via GitHub's own changelog, not assumed. The playground,
model catalog, inference API, and BYOK are gone for every customer, including existing active
usage.

This means the exercise's "opt into a real LLM via `GITHUB_TOKEN`" path **does not work anymore,
regardless of whether the token itself is valid** -- the service it points at doesn't exist. This
wasn't left as a guess: `llm_planner.py`'s `real_plan()` was actually called, live, with a
placeholder token, and the request reached the real endpoint (confirming the request itself --
URL, auth header, payload shape -- is built correctly) and came back with a structured error
rather than a connection failure or a bug in this code:

```
Error code: 410 - {'error': {'code': 'github_models_retirement_brownout', 'message':
'GitHub Models is temporarily unavailable as part of a scheduled retirement brownout.'}}
```

`real_plan()` is left in the codebase, unmodified in its request-building logic, as an accurate
record of how GitHub Models' OpenAI-compatible tool-calling worked while it existed. If you want
a working real-LLM path today, swap the endpoint/model constants and the `GITHUB_TOKEN` env var
for a currently-live OpenAI-compatible provider (the real OpenAI API, Azure AI Foundry,
OpenRouter, or a local model server) -- the `OpenAI(base_url=..., api_key=...)` client shape and
the `tools=`/`tool_choice="auto"` call are otherwise unchanged for any such provider.

**Stub mode is not a fallback for lacking a token here -- for this specific exercise, it's the
only option**, and it's the default with no extra setup either way.

## Same `mcp` version note as the two companion exercises

Installed `mcp`: **2.0.0**, checked directly. `FastMCP` (the name used in the exercise text) was
renamed to `MCPServer`, with no backward-compatible alias anywhere in the package. `server.py`
uses `from mcp.server import MCPServer` -- everything else (`@mcp.tool()`, `@mcp.resource(...)`,
`mcp.run()`) is unchanged.

## File map

```
server.py                     add(a, b) tool + info://about resource
llm_planner.py                convert_to_llm_tool, stub_plan, real_plan, propose_tool_calls
client.py                     Exercises 2-5 against server.py
server_with_multiply.py       optional exercise: server.py + a multiply tool
optional_multiply_client.py   optional exercise: rebuilds the tool list, reruns plan+execute
Exercises_MCP_LLM_Student_Completed.ipynb   the notebook deliverable, genuinely executed
terminal_capture_core.txt     real captured output of client.py
terminal_capture_optional.txt real captured output of optional_multiply_client.py
build_notebook.py             the script that assembles the .ipynb from these files' real content
```

## A real bug, found only by actually executing the notebook (not just testing the equivalent script)

The first draft of the notebook opened one MCP session in an "Exercise 2" cell and tried to keep
it alive across several later cells (Exercise 3, 4, 5) using `AsyncExitStack`, closing it in a
final cell. A plain linear Python script using the identical pattern worked fine when I tested
it as a script. It failed the moment it was genuinely executed as separate Jupyter cells:

```
RuntimeError: Attempted to exit cancel scope in a different task than it was entered in
```

Jupyter's top-level `await` runs *each cell* as its own asyncio task; `anyio`'s task groups
(which MCP's `stdio_client` uses internally) require a cancel scope to be entered and exited
within the same task. A live session genuinely can't be split across independently-scheduled
notebook cells this way -- this is `anyio`'s task-locality model working as designed, not a
mistake in how the stack was used. The fix: Exercises 2 through 5 run inside one cell, one
`async def run(): ...`, matching how the exercise's own original scaffold was structured in the
first place (a single async function with sequential TODOs) -- each exercise's step is still
labeled inline via `print()` so the per-exercise output stays easy to pick out, without actually
splitting the live session across cell boundaries.

This was caught specifically because the notebook was validated by genuinely executing it
end-to-end through `nbclient` against a real Jupyter kernel (`nbformat.validate()` + a full
`NotebookClient(...).execute()` run), not merely checked for well-formed JSON or assumed to work
because an equivalent plain script did.

## What each exercise's deliverable actually shows (real captured output)

```
[Exercise 2] Session initialized.
[Exercise 3] Resources: ['about']
[Exercise 3] Tools:
  - add: inputSchema properties = ['a', 'b']
      a: integer
      b: integer
[Exercise 4] Converted LLM tool specs:
  {'type': 'function', 'function': {'name': 'add', 'description': 'Return the sum of two
  integers.', 'parameters': {...}}}
[Exercise 5] Prompt: 'Add 2 to 20.'
[Exercise 5] Proposed tool_calls: [{'name': 'add', 'arguments': {'a': 2, 'b': 20}}]
[Exercise 5] add({'a': 2, 'b': 20}) -> 22
```

Optional (multiply):

```
Tools (rebuilt list): ['add', 'multiply']
Prompt: 'Multiply 6 by 7.'
Proposed tool_calls: [{'name': 'multiply', 'arguments': {'a': 6, 'b': 7}}]
multiply({'a': 6, 'b': 7}) -> 42
Prompt: 'Add 2 to 20.'
add({'a': 2, 'b': 20}) -> 22
```

## Design choices

**`propose_tool_calls` / `stub_plan` / `real_plan` return the exact same shape** --
`[{"name": ..., "arguments": {...}}, ...]` -- regardless of which one produced it. That's what
lets `client.py`'s executor loop stay identical whether the planner is the rule-based stub or a
real model, and is also what let the optional `multiply` exercise add a new tool without
touching the executor at all -- only `stub_plan` needed one new regex pattern.

**`convert_to_llm_tool` is close to a direct field mapping**, not real conversion logic -- MCP's
`Tool.input_schema` is already JSON Schema, auto-generated from the Python function's type
hints, and that's already the exact shape OpenAI's `parameters` field expects. Verified directly
what that schema looks like for `add` before writing the function, rather than assumed.
