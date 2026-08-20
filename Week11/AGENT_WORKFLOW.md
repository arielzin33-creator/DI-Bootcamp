# Workflow — Building AI Agents on Local LLMs

A repeatable process for turning "I want an assistant that can do X" into a running agent
on your own machine. Distilled from the Day 1–3 workshop; generalised so it works for any
domain.

Companion file: **`agent_template.py`** — the code side of this workflow.

---

## The one idea everything rests on

```
DISCOVER  →  DECIDE  →  EXECUTE  →  SYNTHESIZE
   ask         the        YOUR        the AI
   the       AI picks     code       writes
  server     a tool     runs it     the answer
                  ↑                     │
                  └── loop until done ──┘
```

**The model never runs anything.** It only names a tool and its arguments. Your code
executes. That boundary is what makes the whole thing safe and debuggable — and it's the
difference between "tool use" (one call, stop) and an **agent** (loop until done).

Every framework — LangGraph, CrewAI, smolagents, n8n, OpenAI Agents SDK — is this loop
with different packaging. Build it by hand once and you can read all of them.

---

## Phase 0 · Pick the model (5 min)

Tool-calling is a *skill*. Some local models have it, some don't, and it has nothing to do
with how well they chat.

| Model | Size | Tool calling | Use when |
|---|---|---|---|
| `qwen2.5:7b` | 4.7 GB | **Excellent** | Default. Steady multi-step chains. |
| `qwen3:8b` | 5.2 GB | Excellent | Newer, slightly stronger reasoning. |
| `glm4:9b` | 5.5 GB | Good | Solid; a bit chattier. |
| `mistral:7b` | 4.4 GB | OK | Single tool calls fine, chains wobble. |
| `llama3.2:3b` | 2.0 GB | Weak | Fast demos, one tool, low RAM. |
| `deepseek-r1` | 5.2 GB | Poor for tools | Reasoning-first; not a tool caller. |

```bash
ollama pull qwen2.5:7b
```

**Rule of thumb on a 16 GB machine:** a 7–9B model is the sweet spot. Below 7B the agent
starts *typing* tool calls as plain text instead of calling them (the template has a
salvage net for exactly this — but the real fix is a bigger model).

> **If your agent ignores its tools, change the model before you change anything else.**
> Nine times out of ten that's the problem, and you'll waste an hour on prompts otherwise.

---

## Phase 1 · Design the tools — on paper, before any code (15 min)

This is the phase people skip, and it's the one that decides whether the agent works.

**Write the docstring first.** If you can't write a clear one, the tool is designed wrong.
The docstring is not documentation — **it is the prompt the model reads when deciding**.

Four rules:

1. **Say WHEN, not just what.**
   - ✗ `"Searches the web."`
   - ✓ `"Search the web for current facts, news, or statistics. Use this when a single Wikipedia page isn't enough — e.g. a population figure, a price, or recent events."`

2. **One job per tool.** List *and* read? That's two tools. Let the model chain them —
   that's the entire point of the loop.

3. **Show the argument shape by example.** Models guess badly.
   - ✓ `"topic: A single subject or page title, e.g. 'Cape Verde' — NOT a full question."`

4. **Return a string, never raise.** An error string is something the model can read and
   react to. An exception just kills your agent.
   ```python
   return f"Weather unavailable: {e}"     # the model can say "that failed"
   ```

Sketch your tools in a table before coding:

| Tool | When the model should reach for it | Args | Returns |
|---|---|---|---|
| | | | |

---

## Phase 2 · Build the server (20 min)

Every tool is the same four things: **decorator · docstring · body · return a string.**

```python
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("YourServerName")

@mcp.tool()
def your_tool(arg: str) -> str:
    """<the WHEN docstring from Phase 1>

    Args:
        arg: <shape, with an example>
    """
    import requests            # import INSIDE = isolation; one bad dep won't
    try:                       # stop the whole server from starting
        ...
        return "a string"
    except Exception as e:
        return f"Unavailable: {e}"

if __name__ == "__main__":
    import sys
    if sys.stdin.isatty():
        mcp.run(transport="streamable-http")   # you ran it → HTTP on :8000
    else:
        mcp.run()                              # a host spawned it → STDIO
```

**Add ONE tool. Test it. Then add the next.** Do not write four tools and then debug.

Also available, and worth knowing who drives each:

| Primitive | Who triggers it | Use for |
|---|---|---|
| **Tool** | the **model** pulls it | actions and lookups |
| **Resource** | your **app** pushes it | background context (loaded at startup) |
| **Prompt** | the **user** picks it | canned workflows from a menu |

Only tools go through the decision loop. Resources are context you choose to inject —
that's `PRELOAD_RESOURCES` in the template.

---

## Phase 3 · Verify the server before touching the agent (5 min)

Two terminals, always.

```bash
python your_server.py
```

Then check what it actually offers — don't assume:

```bash
npx @modelcontextprotocol/inspector python your_server.py
```

> **The server reads its code once, at startup.** Edited a tool? **Restart it.** This will
> bite you at least twice today. If a tool you just wrote isn't showing up, that's why.

---

## Phase 4 · Wire up the agent (10 min)

```bash
cp agent_template.py my_agent.py
```

Edit **only** the CONFIG block:

1. `MODEL` — from Phase 0.
2. `SERVERS` — point the `local` entry at your server's URL.
3. `SYSTEM_PROMPT` — what the agent is, when to use tools, how to answer. Keep it short;
   the per-tool docstrings do the real steering.
4. `PRELOAD_RESOURCES` — any resource URIs to push into context at startup.

Run it. You should see your tools listed, then a prompt.

```bash
python my_agent.py
```

**Test in this order** — each step proves one thing:

| Ask | Proves |
|---|---|
| something only your tool can answer | DISCOVER + DECIDE + EXECUTE work |
| a two-part question needing two tools | the **loop** works (result 1 feeds call 2) |
| "what did I just ask you?" | **memory** works |
| something with a deliberately bad argument | errors come back as text, not a crash |

---

## Phase 5 · Add a second server (10 min, optional)

Uncomment the second entry in `SERVERS`. That's it — the template merges the tool lists
and routes each call back to its owning server. The model has no idea the tools live in
different places; that's the whole point of a shared protocol.

Two rules the moment a real service is involved:

- **Secrets live in `.env`, never in code, never in the model's context.** The app owns
  keys, project ids, connection details. Put them in `ARG_INJECTORS` and the template
  merges them in *after* the model has chosen — the model never sees or guesses them.
- **Feed it the schema.** The model cannot guess your column names. Look them up in
  `on_connect()` and append them to the system prompt. There's a worked example in the
  template.

This is what Claude Desktop and Goose are: a loop, several server connections, and a map
of who owns which tool.

---

## Phase 6 · Harden it

The template already handles these — worth knowing *why* each exists:

| Guard | Why |
|---|---|
| `MAX_ROUNDS` | an agent that never decides it's done will loop forever |
| `trim()` on history | local context windows are small; but never cut an assistant/tool pair apart |
| tool errors returned as text | the model can recover or explain; an exception can't be recovered from |
| `salvage_tool_call()` | small models sometimes *type* the call instead of making it |
| malformed-JSON handling | small models emit bad argument JSON; tell the model, don't crash |
| `ARG_INJECTORS` | connection details are the app's job, never the model's |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| New tool not listed | server wasn't restarted | restart the server |
| Model ignores the tool | docstring says *what*, not *when* | rewrite the docstring |
| Still ignores it | model is too small | move to `qwen2.5:7b` or larger |
| Agent prints JSON at the user | model typed the call as text | salvage net catches it; bigger model fixes it |
| `tool_calls` is `None` → TypeError | didn't guard the None case | `for tc in (msg.tool_calls or []):` |
| Chains stop after one tool | no loop, or `MAX_ROUNDS` too low | that loop *is* the agent |
| Wrong DB columns invented | model never saw the schema | inject it in `on_connect()` |
| 403 from a web API | missing `User-Agent` | send a real one |
| Connection refused | server not running | Terminal 1 |

---

## The checklist

```
[ ] Model pulled and known to call tools
[ ] Every tool's docstring says WHEN
[ ] One job per tool
[ ] Every tool returns a string, never raises
[ ] Server verified with Inspector before the agent was written
[ ] Server restarted after the last edit
[ ] Agent runs the loop, not a single call
[ ] Two-tool chain tested
[ ] Memory tested
[ ] Secrets in .env, injected by the app
[ ] Round limit and history trim in place
```

---

## Where this goes next

Once this loop is second nature, the frameworks are just packaging:

- **smolagents** — the same loop in ~5 lines. Great for prototypes.
- **LangGraph** — the loop as a typed graph: retries, checkpoints, determinism.
- **CrewAI** — several agents with roles, collaborating.
- **LlamaIndex** — the same loop, retrieval-first (RAG over your documents).
- **n8n** — the same loop, visual and low-code.

All of them: discover, decide, execute, synthesize. You've written it by hand, so you can
read any of them.
