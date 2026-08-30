# Workshop — Extend the Server, Then Build the Agent

Two parts, done one step at a time. Run after every step, see it work, then move on.

**Part 1** — you add two new tools to the server you built on Day 1.
**Part 2** — you build an assistant that uses those tools (and, at the end, a cloud database too).

---

## Setup (do this once)

```bash
pip install "mcp[cli]" openai requests python-dotenv ddgs
ollama pull qwen2.5:7b
```

Don't start the server yet — in Part 1 we're going to edit it first.

---

# PART 1 — Add two tools to your Day 1 server

Open your Day 1 server file: **`../Day1-Build-a-Server/day1_server_full.py`**.
You already have `read_file` and `get_weather` there. We'll add two more, the same way: `@mcp.tool()`, a clear docstring, a body, return a string.

## Stage 1 — Add `wikipedia_summary`

Paste this **under your `get_weather` tool**, before the resource section:

```python
@mcp.tool()
def wikipedia_summary(topic: str) -> str:
    """Get a short summary of any topic from Wikipedia.
    Use this for facts, history, definitions, or general knowledge.

    Args:
        topic: A single subject or Wikipedia page title, e.g. 'Cape Verde',
               'France', 'Tel Aviv' — NOT a full question.
    """
    import requests, urllib.parse
    url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(topic)
    headers = {"User-Agent": "MCP-Workshop/1.0 (educational demo)"}
    try:
        r = requests.get(url, headers=headers, timeout=5)
        r.raise_for_status()
        return r.json().get("extract", "No summary found.")
    except Exception as e:
        return f"Wikipedia unavailable: {e}"
```

**What to notice:**
- Same shape as every tool: decorator, docstring, body, return a string.
- The **docstring is the prompt** — it even tells the AI to pass a page title, not a question.
- We use `requests` (not `urllib`) because it ships fresh SSL certificates.
- Wikipedia **requires a `User-Agent` header**, or it says 403 Forbidden. (A real-world rule you just met.)

## Stage 2 — Add `web_search`

Paste this right below `wikipedia_summary`:

```python
@mcp.tool()
def web_search(query: str) -> str:
    """Search the web for current facts, news, or statistics on any topic.
    Use this when a single Wikipedia page isn't enough — e.g. a country's
    population, a price, or recent events.

    Args:
        query: What to search for, e.g. 'Cape Verde population 2024'.
    """
    from ddgs import DDGS
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
        if not results:
            return "No results found."
        return "\n\n".join(f"{r['title']}: {r['body']}" for r in results)
    except Exception as e:
        return f"Search unavailable: {e}"
```

**What to notice:**
- `ddgs` searches DuckDuckGo — free, no API key.
- The docstring tells the AI **when** to reach for this instead of Wikipedia. That one sentence is how it decides.

## Stage 3 — Start the server and check your work

Now start it (**Terminal 1**, and leave it running):

```bash
python ../Day1-Build-a-Server/day1_server_full.py
```

> **Remember:** the server reads its code once, at startup. If you edit it again later, you must **restart** it.

**Verify** the two new tools are really there (Terminal 2):

```bash
python ../Day1-Build-a-Server/prove_it_runs.py
```

You should see **4 tools** listed: `read_file`, `get_weather`, `wikipedia_summary`, `web_search`.
If you only see 2, you either forgot to save the file or forgot to restart the server. 

---

# PART 2 — Build the agent

Now open **`workshop_agent_START.py`**. Run it once to confirm it connects:

```bash
python workshop_agent_START.py
```

You should see: `Skeleton is connected. Now add Stage 4 from the guide.`

> Each stage below **replaces the code under the `>>> YOUR CODE GOES HERE <<<` line.** Keep everything above it as-is.

## Stage 4 — DISCOVER: what can the server do?

```python
        # STAGE 4 — ask the server for its tools
        tools = (await session.list_tools()).tools
        print("The server offers these tools:")
        for t in tools:
            print("  -", t.name)
```

**Run it.** You should see all 4 tool names — including the two you just added.

**What just happened:** the *Discover* step. We never hard-code tool names — we *ask* the server. (And look: the tools you added in Part 1 showed up here automatically. Nobody changed the client.)

## Stage 5 — DECIDE: let the AI pick a tool

```python
        # STAGE 5 — ask the AI which tool to use
        tools = (await session.list_tools()).tools
        openai_tools = [to_openai_tool(t) for t in tools]

        messages = [
            {"role": "system", "content": "You are a helpful assistant. Use a tool when the question needs live data."},
            {"role": "user",   "content": "What is the weather in Tel Aviv?"},
        ]

        resp = llm.chat.completions.create(
            model=MODEL, messages=messages,
            tools=openai_tools, tool_choice="auto")
        msg = resp.choices[0].message

        print("The AI wants to call:", msg.tool_calls)
```

**Run it.** The AI should ask for `get_weather` with `{"city": "Tel Aviv"}`.

**What just happened:** the AI **chose** a tool — but it only *named* it. No weather came back. Deciding and doing are two different jobs.

## Stage 6 — EXECUTE + SYNTHESIZE: run it, get the answer

```python
        # STAGE 6 — the full 4-step loop, one time
        tools = (await session.list_tools()).tools
        openai_tools = [to_openai_tool(t) for t in tools]

        messages = [
            {"role": "system", "content": "You are a helpful assistant. When a tool result is given, use it and answer directly."},
            {"role": "user",   "content": "What is the weather in Tel Aviv?"},
        ]

        resp = llm.chat.completions.create(
            model=MODEL, messages=messages,
            tools=openai_tools, tool_choice="auto")
        msg = resp.choices[0].message

        # save the AI's turn (it asked for a tool)
        messages.append({
            "role": "assistant", "content": msg.content,
            "tool_calls": [
                {"id": tc.id, "type": "function",
                 "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                for tc in msg.tool_calls],
        })

        # EXECUTE each tool the AI asked for, and save the result
        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            result = await session.call_tool(tc.function.name, arguments=args)
            print("Tool result:", result_text(result))
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": result_text(result)})

        # SYNTHESIZE — ask the AI again, now that it has the real data
        final = llm.chat.completions.create(model=MODEL, messages=messages)
        print("\nAnswer:", final.choices[0].message.content)
```

**Run it.** Real weather, then a plain answer.

**What just happened:** the last two steps. **Execute** — *your code* runs the tool (the AI never does). **Synthesize** — you hand the real result back and the AI writes the sentence. Watch the roles stack up: **system → user → assistant → tool → answer**.

## Stage 7 — Make it a real CHAT (loop + memory)

```python
        # STAGE 7 — a chat that remembers
        tools = (await session.list_tools()).tools
        openai_tools = [to_openai_tool(t) for t in tools]

        messages = [
            {"role": "system", "content": "You are a helpful assistant. When a tool result is given, use it and answer directly."},
        ]

        print("Chat ready! (type 'quit' to exit)\n")
        while True:
            user = input("You: ").strip()
            if user.lower() in ("quit", "exit"):
                break
            messages.append({"role": "user", "content": user})

            # inner AGENT loop: keep calling tools until the AI is done (max 5 rounds)
            for _ in range(5):
                resp = llm.chat.completions.create(
                    model=MODEL, messages=messages,
                    tools=openai_tools, tool_choice="auto")
                msg = resp.choices[0].message

                if not msg.tool_calls:
                    messages.append({"role": "assistant", "content": msg.content})
                    print("Agent:", msg.content, "\n")
                    break

                messages.append({
                    "role": "assistant", "content": msg.content,
                    "tool_calls": [
                        {"id": tc.id, "type": "function",
                         "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                        for tc in msg.tool_calls],
                })
                for tc in msg.tool_calls:
                    args = json.loads(tc.function.arguments)
                    print(f"  [tool] {tc.function.name}({args})")
                    result = await session.call_tool(tc.function.name, arguments=args)
                    messages.append({"role": "tool", "tool_call_id": tc.id, "content": result_text(result)})
```

**Run it.** Try, in one session:
- *"weather in Tel Aviv?"*  → uses `get_weather`
- *"What is France known for, and what's the weather in its capital?"*  → uses **two** tools in a row
- *"and what did I just ask you?"*  → proves it remembers

**What just happened:** two big ideas at once.
- **Memory:** everything lives in one growing `messages` list, sent every time — that's the memory.
- **Agent loop:** the `for _ in range(5)` lets the AI call a tool, read the result, decide the next step, and call another — until it's done. That's the difference between "one tool" and a real agent.

## Stage 8 — Add a SECOND server: Neon (your database)

A host can hold many servers at once. Let's add Neon so the same chat can query a database.
You need a `.env` file next to this script with `NEON_API_KEY=your_key`.

> **Two things about Neon your skeleton already handles for you:**
> Neon returns SQL results as `structuredContent`, not plain text — the `extract()` / `result_text()` helpers in your skeleton read both, so nothing breaks. And the app (not the AI) supplies the `projectId` and `databaseName` — you'll set those below.

**8a.** Put this at the **TOP of your code block** (before the `tools = ...` line from Stage 7). It builds a tool→server map, connects Neon, finds your project id, and reads your table+column names so the AI won't guess wrong columns:

```python
        # remember which server owns each tool
        owner = {}          # tool name -> the session that runs it
        all_tools = []      # every tool, in the model's format

        for t in (await session.list_tools()).tools:
            owner[t.name] = session
            all_tools.append(to_openai_tool(t))

        # connect Neon (only if a key is set)
        neon_pid, schema_hint = "", ""
        NEON_KEY = os.environ.get("NEON_API_KEY", "")
        if NEON_KEY:
            r2, w2, _ = await stack.enter_async_context(
                streamablehttp_client("https://mcp.neon.tech/mcp",
                                      headers={"Authorization": f"Bearer {NEON_KEY}"}))
            neon = await stack.enter_async_context(ClientSession(r2, w2))
            await neon.initialize()
            for t in (await neon.list_tools()).tools:
                if t.name == "run_sql":                 # just this one, to keep it focused
                    owner[t.name] = neon
                    all_tools.append(to_openai_tool(t))

            # find the project id
            for tn in ("list_projects", "list_shared_projects"):
                try:
                    d = extract(await neon.call_tool(tn, arguments={}))
                    projs = d.get("projects", d) if isinstance(d, dict) else d
                    if isinstance(projs, list) and projs:
                        neon_pid = projs[0].get("id", ""); break
                except Exception:
                    pass
            print("Neon project:", neon_pid or "(not found — paste it manually)")

            # read the table + column names, so the AI uses REAL column names
            if neon_pid:
                d = extract(await neon.call_tool("run_sql", arguments={
                    "projectId": neon_pid, "databaseName": "neondb",
                    "sql": "SELECT table_name, column_name FROM information_schema.columns "
                           "WHERE table_schema='public' ORDER BY table_name, ordinal_position"}))
                rows = d.get("rows", d) if isinstance(d, dict) else d
                cols = {}
                for row in rows:
                    if isinstance(row, dict) and "table_name" in row:
                        cols.setdefault(row["table_name"], []).append(row.get("column_name", ""))
                schema_hint = " Database tables: " + "; ".join(
                    f"{t}({', '.join(c)})" for t, c in cols.items())
                print("Schema:", schema_hint)
```

**8b.** Now make **three small edits** to your Stage 7 code:

1. Add the schema to your system message so the AI knows the real columns:

```python
        messages = [
            {"role": "system", "content":
                "You are a helpful assistant. When a tool result is given, use it and answer directly. "
                "For run_sql, the projectId and databaseName are provided for you." + schema_hint},
        ]
```

2. In **both** `llm.chat.completions.create(...)` calls, change `tools=openai_tools` to `tools=all_tools`.

3. In the tool-running loop, **route** each call to its owner and fill in Neon's ids:

```python
                for tc in msg.tool_calls:
                    args = json.loads(tc.function.arguments)
                    if tc.function.name == "run_sql":       # the APP supplies these, not the AI
                        args["projectId"] = neon_pid
                        args["databaseName"] = "neondb"
                    the_session = owner.get(tc.function.name, session)   # <-- ROUTE it
                    print(f"  [tool] {tc.function.name}({args})")
                    result = await the_session.call_tool(tc.function.name, arguments=args)
                    messages.append({"role": "tool", "tool_call_id": tc.id, "content": result_text(result)})
```

**Run it.** In one chat: *"how many rows are in the users table?"* (Neon) · *"give me a list of products and prices"* (Neon, uses the real column names) · *"what's the weather in Tel Aviv?"* (local).

**What just happened:** you built a mini **host**. It holds two server connections, merges all their tools, and the `owner` map sends each call to the right server. Two real-world touches: the AI can't guess your database columns, so you fed it the schema; and the app fills in the project id and database name, because you never trust the AI with connection details. The AI has no idea the tools live in different places — that's the point of a shared standard. This is how Claude Desktop and Goose work.

---

## You're done 🎉

You **extended a server** with two new tools, then built an assistant that discovers tools, lets the AI decide, runs them, remembers the chat, loops until done, and talks to two servers at once.

**Reference solutions** (if you get stuck): the finished server is `../Day1-Build-a-Server/day1_server_full.py`; the finished agent is `../Day2-Connect-an-LLM/chat_agent_multi.py`.

**Make it yours:** add one more `@mcp.tool()` to the server, restart it, and watch the chat pick it up — without changing the agent at all.
