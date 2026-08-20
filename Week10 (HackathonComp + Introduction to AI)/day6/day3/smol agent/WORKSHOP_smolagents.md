# Bonus Workshop — The Same Agent, With a Framework (smolagents)

**For students who finished the manual build.** You wrote the agent loop by hand — discover, decide, execute, synthesize, memory, routing. Now watch a framework do the exact same thing in a fraction of the code.

Nothing new happens here. It's the **same loop** you already understand — smolagents just hides the plumbing.

Start from **`smol_agent_START.py`**. Paste one stage at a time into the marked spot.

---

## Setup (once)

```bash
pip install "smolagents[litellm]" "mcp[cli]" python-dotenv
ollama pull qwen2.5:7b
```

**Terminal 1** — your Day 1 server, running:

```bash
python ../Day1-Build-a-Server/day1_server_full.py
```

**Terminal 2** — run the skeleton to confirm it connects:

```bash
python smol_agent_START.py
```

You should see the tool names, then `Connected. Now add Stage 1 from the guide.`

> Remember the manual version? That was ~90 lines. Watch how short this is.

---

## Stage 1 — Build the agent and ask one question

Replace the `print("Connected...")` line with:

```python
    # STAGE 1 — hand the tools to an agent and ask it something
    agent = ToolCallingAgent(tools=tools, model=model)
    print(agent.run("What is the weather in Tel Aviv?"))
```

**Run it.** You'll see smolagents print each step (which tool, what came back), then the answer.

**What just happened:** `ToolCallingAgent(tools=..., model=...)` **is** the whole loop you wrote by hand — discover, decide, execute, synthesize, and it repeats until done. Two lines replaced your fifty. The loop didn't change; it just moved inside the library.

---

## Stage 2 — Make it a chat

Replace Stage 1's code with a loop so you can keep talking:

```python
    # STAGE 2 — a chat
    agent = ToolCallingAgent(tools=tools, model=model)

    print("Chat ready! (Ctrl+C to quit)\n")
    while True:
        try:
            question = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not question:
            continue
        print("\nAgent:", agent.run(question), "\n")
```

**Run it.** Try: *"What is France known for, and what's the weather in its capital?"*
Watch it call **two tools in a row** on its own — the multi-step chain you built by hand, now automatic.

> Note: smolagents keeps the memory of a single `agent.run(...)` internally. Each new question starts fresh unless you keep one agent and reuse it (which we do here).

---

## Stage 3 — Add the second server (Neon)

Now connect Neon too — the same idea as the manual version, but smolagents merges the tools for you.
You need a `.env` file with `NEON_API_KEY=your_key`.

**3a.** At the **top of the file**, add these imports and settings (below the existing ones):

```python
import asyncio, json

NEON_KEY = os.environ.get("NEON_API_KEY", "")
WANTED   = {"read_file", "get_weather", "wikipedia_summary", "web_search", "run_sql"}
```

**3b.** smolagents lets the model fill in `run_sql`'s arguments, so — unlike the manual version — we can't force the project id in code. Instead we look it up once and give it to the agent as context. Paste this helper **above** the `with MCPClient(...)` line (the full version is in `smol_agent_multi.py` if you'd rather copy it):

```python
    # look up the Neon project id + schema, to tell the agent about them
    def neon_context():
        if not NEON_KEY:
            return ""
        from mcp import ClientSession
        from mcp.client.streamable_http import streamablehttp_client
        # (copy the neon_context() function from smol_agent_multi.py — it's ~30 lines)
        ...
    DB_CONTEXT = neon_context()
```

> To keep the workshop moving, just **copy the whole `neon_context()` function from `smol_agent_multi.py`.** It's plumbing, not the lesson.

**3c.** Change the connection to include Neon, and **filter** the tools (Neon has 34 — too many for a small model):

```python
    servers = [LOCAL_SERVER]
    if NEON_KEY:
        servers.append({"url": "https://mcp.neon.tech/mcp", "transport": "streamable-http",
                        "headers": {"Authorization": f"Bearer {NEON_KEY}"}})

    with MCPClient(servers) as all_tools:
        tools = [t for t in all_tools if t.name in WANTED]     # trim Neon's extras
        agent = ToolCallingAgent(tools=tools, model=model)
        ...  # your Stage 2 chat loop, but change agent.run(question) to:
        #     agent.run((DB_CONTEXT + "\n\n" if DB_CONTEXT else "") + question)
```

**Run it.** In one chat: *"how many rows are in the users table?"* (Neon) and *"what's the weather in Tel Aviv?"* (local).

**What just happened:** smolagents connected to **both** servers, merged their tools, and drove the whole loop. Two differences from the manual version, both about what a framework can and can't do for you:
- **Filtering** — you still trim Neon's 34 tools down to `run_sql`, because context is limited.
- **The project id** — smolagents fills tool arguments itself, so you can't overwrite them; instead you *tell* the agent the id and schema as context. (The manual version could force them — that's a trade-off of using a framework.)

---

## Manual vs framework — the takeaway

| | You wrote by hand | smolagents |
|---|---|---|
| The 4-step loop | you wrote it | hidden inside the library |
| Multi-step chaining | your `for _ in range(5)` | automatic |
| Memory | your `messages` list | handled for you |
| Control over tool args | full (you overwrote projectId) | limited (model fills them) |
| Lines of code | ~90 | ~15 |

**The point:** it's the *same architecture*. Now that you understand what's underneath, you're allowed to let a library do the boring part. That's the whole reason we built it by hand first.

**Reference solution:** `smol_agent_multi.py` is the finished file.
