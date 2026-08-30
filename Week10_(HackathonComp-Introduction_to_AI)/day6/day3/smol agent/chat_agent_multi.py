"""
chat_agent_multi.py — one chat, TWO MCP servers (local + Neon cloud database).

THE BIG IDEA (this is how Claude Desktop / Goose really work)
    A "host" can connect to MANY servers at once. It merges all their tools into
    one list for the model, and remembers WHICH server owns each tool. When the
    model calls a tool, the host routes the call to the right server.

    Server A (local, Day 1):  read_file, get_weather
    Server B (Neon cloud):    run_sql   -> your real Postgres database
    One chat can use all of them.

BEFORE YOU RUN
    pip install "mcp[cli]" openai
    ollama pull qwen2.5:7b
    Terminal 1:  python ../Day1-Build-a-Server/day1_server_full.py
    Set your Neon key (or skip Neon — the chat still works with just the local server):
        PowerShell:  $env:NEON_API_KEY = "your_key"
        Git Bash:    export NEON_API_KEY=your_key

RUN (Terminal 2)
    python chat_agent_multi.py
    Try: "what's the weather in Tel Aviv?"        (local server)
         "how many rows are in the users table?"  (Neon server)
         quit
"""

import asyncio
import json
import os
from contextlib import AsyncExitStack

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from openai import OpenAI

# Load secrets from a .env file (pip install python-dotenv).
# Put your key in a file named .env next to this script:  NEON_API_KEY=napi_...
from dotenv import load_dotenv
load_dotenv()

# ===== STEP 0 — settings =====================================================
LOCAL_URL       = "http://127.0.0.1:8000/mcp/"      # Server A: your Day 1 server
NEON_URL        = "https://mcp.neon.tech/mcp"        # Server B: Neon cloud
NEON_API_KEY    = os.environ.get("NEON_API_KEY", "") # from .env; empty = skip Neon
NEON_PROJECT_ID = "rough-dawn-06481786"       # paste from console.neon.tech if you have an ORG key
NEON_DB         = "neondb"
MODEL           = "qwen2.5:7b"

llm = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")


def to_openai_tool(mcp_tool):
    return {"type": "function", "function": {
        "name": mcp_tool.name,
        "description": mcp_tool.description or "",
        "parameters": mcp_tool.inputSchema,
    }}


def _parts(result):
    """Tool results have .content; resource results have .contents. Handle both."""
    return getattr(result, "content", None) or getattr(result, "contents", []) or []


def extract(result):
    """Get data out of a result (structuredContent for Neon, text for local)."""
    data = getattr(result, "structuredContent", None)
    if data:
        return data
    text = "".join(getattr(c, "text", "") for c in _parts(result)).strip()
    try:
        return json.loads(text) if text else text
    except Exception:
        return text


def result_text(result):
    """Always return a readable string for the model."""
    text = "".join(getattr(c, "text", "") for c in _parts(result))
    return text or json.dumps(extract(result))[:2000]


async def open_session(stack, url, headers=None):
    """Open one MCP server connection and return a ready session."""
    r, w, _ = await stack.enter_async_context(streamablehttp_client(url, headers=headers))
    session = await stack.enter_async_context(ClientSession(r, w))
    await session.initialize()
    return session


async def chat():
    # AsyncExitStack lets us open several servers and close them all cleanly.
    async with AsyncExitStack() as stack:
        tools_for_llm = []     # all tools from all servers, for the model
        owner = {}             # tool name -> which server session runs it
        background = ""        # context we inject (notes + db schema)

        # ===== STEP 1 — connect Server A (local) =========================
        print("Connecting to local server...")
        local = await open_session(stack, LOCAL_URL)
        for t in (await local.list_tools()).tools:
            tools_for_llm.append(to_openai_tool(t))
            owner[t.name] = local
        # load its notes resource into context
        res = (await local.list_resources()).resources
        if res:
            background += "Today's notes: " + result_text(await local.read_resource(str(res[0].uri))) + "\n"

        # ===== STEP 2 — connect Server B (Neon), if a key is set =========
        neon_pid = ""
        if NEON_API_KEY:
            print("Connecting to Neon...")
            neon = await open_session(stack, NEON_URL,
                                      headers={"Authorization": f"Bearer {NEON_API_KEY}"})
            # Neon has 34 tools — hand the model only run_sql.
            for t in (await neon.list_tools()).tools:
                if t.name == "run_sql":
                    tools_for_llm.append(to_openai_tool(t))
                    owner[t.name] = neon

            # find the project id (paste one above if you have an org key)
            neon_pid = NEON_PROJECT_ID
            if not neon_pid:
                for tn in ("list_projects", "list_shared_projects"):
                    try:
                        d = extract(await neon.call_tool(tn, arguments={}))
                        projs = d.get("projects", d) if isinstance(d, dict) else d
                        if isinstance(projs, list) and projs:
                            neon_pid = projs[0].get("id", "")
                            break
                    except Exception:
                        pass

            if neon_pid:
                print("  Neon project id:", neon_pid)
            else:
                print("  !! No Neon project id found. If you have an ORG key, paste")
                print("     your project id into NEON_PROJECT_ID at the top of this file.")

            # fetch the schema (table + column names) so the model won't guess
            if neon_pid:
                try:
                    d = extract(await neon.call_tool("run_sql", arguments={
                        "projectId": neon_pid, "databaseName": NEON_DB,
                        "sql": "SELECT table_name, column_name FROM information_schema.columns "
                               "WHERE table_schema='public' ORDER BY table_name, ordinal_position"}))
                    rows = d.get("rows", d) if isinstance(d, dict) else d
                    schema = {}
                    for row in rows:
                        if isinstance(row, dict) and "table_name" in row:
                            schema.setdefault(row["table_name"], []).append(row.get("column_name", ""))
                    sch = "; ".join(f"{t}({', '.join(c)})" for t, c in schema.items())
                    background += f"Neon database schema: {sch}\n"
                except Exception as e:
                    background += f"(Neon schema unavailable: {e})\n"
        else:
            print("(No NEON_API_KEY set — running with the local server only.)")

        # ===== STEP 3 — the chat loop ===================================
        print("\nTools available to the chat:", list(owner.keys()))
        messages = [{"role": "system", "content": (
            "You are a helpful assistant with tools from multiple servers. "
            "Use a tool when a question needs live data, files, or the database. "
            "For run_sql ALWAYS include projectId and databaseName. "
            "When a tool result is given, trust it and answer directly.\n\n" + background
        )}]

        print("\nChat ready! (type 'quit' to exit)\n")
        while True:
            user = input("You: ").strip()
            if user.lower() in ("quit", "exit"):
                print("Bye!")
                return
            if not user:
                continue

            messages.append({"role": "user", "content": user})

            # the agent loop: let the model call tools until it's done
            for _ in range(6):
                resp = llm.chat.completions.create(
                    model=MODEL, messages=messages,
                    tools=tools_for_llm, tool_choice="auto")
                msg = resp.choices[0].message

                # No tool wanted -> a normal ASSISTANT reply. Save it and stop.
                if not msg.tool_calls:
                    messages.append({"role": "assistant", "content": msg.content})
                    print("Agent:", msg.content, "\n")
                    break

                # It wants tools. First save the ASSISTANT turn (with its tool
                # requests) — the conversation must record who asked for what.
                messages.append({
                    "role": "assistant",
                    "content": msg.content,
                    "tool_calls": [
                        {"id": tc.id, "type": "function",
                         "function": {"name": tc.function.name,
                                      "arguments": tc.function.arguments}}
                        for tc in msg.tool_calls
                    ],
                })

                # Then run each tool and add a TOOL turn for each result.
                for tc in msg.tool_calls:
                    args = json.loads(tc.function.arguments)
                    # The APP owns projectId + databaseName — OVERWRITE whatever
                    # the model guessed (it likes to invent 'my_project_id').
                    if tc.function.name == "run_sql":
                        args["projectId"]    = neon_pid
                        args["databaseName"] = NEON_DB
                    # ROUTE the call to the server that owns this tool
                    session = owner.get(tc.function.name, local)
                    print(f"  [tool] {tc.function.name}({args})")
                    result = await session.call_tool(tc.function.name, arguments=args)
                    out = result_text(result)
                    print(f"  [result] {out[:200]}")
                    messages.append({"role": "tool", "tool_call_id": tc.id, "content": out})
            else:
                print("Agent: (stopped after 6 tool rounds)\n")


if __name__ == "__main__":
    asyncio.run(chat())
