"""
smol_agent_multi.py — the SAME multi-server agent, but with smolagents.

You built the manual version by hand (the loop, the routing, the memory — ~90 lines).
smolagents runs that whole loop FOR you. This file connects to the SAME two servers —
your local Day 1 server AND Neon — and lets the framework drive.

Compare the two:
    manual (chat_agent_multi.py):  you write discover / decide / execute / synthesize
    smolagents (this file):        you hand it tools; it runs the loop itself

BEFORE YOU RUN:
    pip install "smolagents[litellm]" "mcp[cli]" python-dotenv
    ollama pull qwen2.5:7b
    Terminal 1:  python ../Day1-Build-a-Server/day1_server_full.py   (keep running)
    (optional) a .env file with:  NEON_API_KEY=your_key
"""

import asyncio
import json
import os

from dotenv import load_dotenv
load_dotenv()

from smolagents import ToolCallingAgent, LiteLLMModel, MCPClient

# ── settings ─────────────────────────────────────────────────────────────────
LOCAL_SERVER = {"url": "http://127.0.0.1:8000/mcp/", "transport": "streamable-http"}
NEON_KEY     = os.environ.get("NEON_API_KEY", "")

# Neon exposes 34 tools — too many for a small model's context. Keep only these:
WANTED = {"read_file", "get_weather", "wikipedia_summary", "web_search", "run_sql"}

model = LiteLLMModel(
    model_id="ollama_chat/qwen2.5:7b",
    api_base="http://localhost:11434",
    num_ctx=8192,
)


# ── (optional) tell the agent about the Neon database ────────────────────────
# smolagents lets the MODEL fill in run_sql's arguments, so we can't overwrite
# projectId the way the manual version did. Instead we look up the project id
# and schema once, and hand them to the agent as context in every question.
def neon_context() -> str:
    if not NEON_KEY:
        return ""
    from mcp import ClientSession
    from mcp.client.streamable_http import streamablehttp_client

    def extract(result):
        data = getattr(result, "structuredContent", None)
        if data:
            return data
        text = "".join(getattr(c, "text", "") for c in getattr(result, "content", [])).strip()
        try:
            return json.loads(text) if text else text
        except Exception:
            return text

    async def go():
        async with streamablehttp_client(
                "https://mcp.neon.tech/mcp",
                headers={"Authorization": f"Bearer {NEON_KEY}"}) as (r, w, _):
            async with ClientSession(r, w) as s:
                await s.initialize()
                pid = ""
                for tn in ("list_projects", "list_shared_projects"):
                    try:
                        d = extract(await s.call_tool(tn, arguments={}))
                        p = d.get("projects", d) if isinstance(d, dict) else d
                        if isinstance(p, list) and p:
                            pid = p[0].get("id", ""); break
                    except Exception:
                        pass
                if not pid:
                    return ""
                d = extract(await s.call_tool("run_sql", arguments={
                    "projectId": pid, "databaseName": "neondb",
                    "sql": "SELECT table_name, column_name FROM information_schema.columns "
                           "WHERE table_schema='public' ORDER BY table_name, ordinal_position"}))
                rows = d.get("rows", d) if isinstance(d, dict) else d
                cols = {}
                for row in rows:
                    if isinstance(row, dict) and "table_name" in row:
                        cols.setdefault(row["table_name"], []).append(row.get("column_name", ""))
                schema = "; ".join(f"{t}({', '.join(c)})" for t, c in cols.items())
                return (f"You can query a Neon Postgres database with run_sql. "
                        f"Always pass projectId='{pid}' and databaseName='neondb'. "
                        f"Tables and columns: {schema}.")
    return asyncio.run(go())


DB_CONTEXT = neon_context()
if DB_CONTEXT:
    print("Neon connected.")

# ── build the list of servers to connect to ─────────────────────────────────
servers = [LOCAL_SERVER]
if NEON_KEY:
    servers.append({"url": "https://mcp.neon.tech/mcp", "transport": "streamable-http",
                    "headers": {"Authorization": f"Bearer {NEON_KEY}"}})

# ── connect, filter tools, run the chat ──────────────────────────────────────
# MCPClient(servers) connects to ALL of them and gives back one combined tool list.
with MCPClient(servers) as all_tools:
    tools = [t for t in all_tools if t.name in WANTED]   # trim Neon's extras
    print("The agent has these tools:", [t.name for t in tools])

    # ToolCallingAgent = the whole discover/decide/execute/synthesize loop, for free.
    agent = ToolCallingAgent(tools=tools, model=model)

    print("\nChat ready! (Ctrl+C to quit)\n")
    while True:
        try:
            question = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not question:
            continue
        # prepend the DB context so the agent knows the project id + real columns
        task = (DB_CONTEXT + "\n\n" if DB_CONTEXT else "") + question
        print("\nAgent:", agent.run(task), "\n")
