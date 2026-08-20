"""
neon_client.py — Day 2 BONUS: the same 4-step loop, pointed at a REAL cloud database.

THE BIG IDEA
    This is byte-for-byte the same loop as day2_client_simple.py. We change
    exactly TWO things:
      1. the URL  -> Neon's cloud MCP server, https://mcp.neon.tech/mcp
      2. add one Authorization header (a Bearer token = your Neon API key)
    Discover -> Decide -> Execute -> Synthesize is identical. That's the point:
    any MCP server with an HTTP endpoint plugs into the same client.

BEFORE YOU RUN
    pip install "mcp[cli]" openai
    ollama pull llama3.2:3b

    1. Free Neon account:  https://console.neon.tech
    2. Create an API key:  Account Settings -> API Keys -> Create new API key
    3. Put the key in an environment variable (so it's not hard-coded):
         PowerShell:  $env:NEON_API_KEY = "your_key_here"
         Git Bash:    export NEON_API_KEY=your_key_here

RUN
    python neon_client.py
    python neon_client.py "How many tables are in my database?"
    python neon_client.py "Show me the 5 most recent rows in any table"

VERIFIED July 2026:
    endpoint https://mcp.neon.tech/mcp  ·  Streamable HTTP  ·  Bearer API-key auth
    (the old .../sse endpoint is deprecated and does NOT support API keys)
"""

import asyncio
import json
import os
import sys

# Only difference in imports vs the local client: nothing. Same transport!
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from openai import OpenAI

# ── STEP 0 · Setup ───────────────────────────────────────────────────────────
NEON_MCP_URL = "https://mcp.neon.tech/mcp"        # <-- the ONLY url change
OLLAMA_BASE  = "http://localhost:11434/v1"
MODEL        = "qwen2.5:7b"                        # steady at tool-calling

NEON_API_KEY = os.environ.get("NEON_API_KEY", "")  # read the key from the env var

# --- If auto-detect fails, fill these in from console.neon.tech ---------------
# Auto-detect (list_projects) only works with a PERSONAL api key. If you have an
# ORGANIZATION key, list_projects returns 404 — just paste your IDs here instead:
NEON_PROJECT_ID = "rough-dawn-06481786"       # your project id (Neon console -> project -> Settings)
NEON_DB         = "neondb"  # your database name (Neon default is 'neondb')

llm = OpenAI(base_url=OLLAMA_BASE, api_key="ollama")


def line(title):
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)


def to_openai_tool(mcp_tool) -> dict:
    """Same converter as the local client — MCP schema -> OpenAI schema."""
    return {
        "type": "function",
        "function": {
            "name": mcp_tool.name,
            "description": mcp_tool.description or "",
            "parameters": {
                "type": "object",
                "properties": mcp_tool.inputSchema.get("properties", {}),
                "required":   mcp_tool.inputSchema.get("required", []),
            },
        },
    }


def extract(result):
    """Get the data out of an MCP tool result. Modern servers (like Neon) put
    it in .structuredContent (a dict); older ones put JSON text in .content."""
    data = getattr(result, "structuredContent", None)
    if data:
        return data
    text = "".join(getattr(c, "text", "") for c in result.content).strip()
    try:
        return json.loads(text) if text else {}
    except Exception:
        return text  # not JSON — hand back the raw string


async def run(prompt: str):
    if not NEON_API_KEY:
        print("ERROR: NEON_API_KEY is not set.")
        print('  PowerShell:  $env:NEON_API_KEY = "your_key"')
        print("  Git Bash:    export NEON_API_KEY=your_key")
        print("  Get a key at: https://console.neon.tech -> Account Settings -> API Keys")
        return

    print(f"\nDay 2 Bonus — LLM + Neon MCP   (model: {MODEL})")

    # SAME two-line connect as the local client — plus ONE header for auth.
    async with streamablehttp_client(
        NEON_MCP_URL,
        headers={"Authorization": f"Bearer {NEON_API_KEY}"},
    ) as (r, w, _):
        async with ClientSession(r, w) as session:
            await session.initialize()

            # ── STEP 1 · DISCOVER ────────────────────────────────────────────
            tools_result = await session.list_tools()
            line(f"[1/4] DISCOVER — Neon offers {len(tools_result.tools)} tool(s)")

            # Neon exposes MANY tools (huge). Hand the LLM only the data ones —
            # sql + table/schema/project — otherwise the tool list alone floods
            # the model's context (and it won't hallucinate a missing tool).
            # Hand the LLM exactly ONE tool for this demo: run_sql. Neon has 34
            # tools (schema-diff, migrations, project admin...) and a small model
            # gets distracted — it starts talking about migrations instead of
            # answering. One clear tool = one clear job.
            sql_tools = [t for t in tools_result.tools if t.name == "run_sql"]
            if not sql_tools:
                sql_tools = [t for t in tools_result.tools if "sql" in t.name.lower()][:1]
            for t in sql_tools:
                print(f"  - {t.name}")
            openai_tools = [to_openai_tool(t) for t in sql_tools]

            # ── Pre-fetch the project id + table names ──────────────────────
            # Neon's run_sql needs a projectId + database name. We fetch them
            # ourselves and hand them to the LLM so it never guesses.
            print("\n  (looking up your project + tables so the LLM has the real schema...)")
            project_id, tables = NEON_PROJECT_ID, ""

            # If you didn't paste a project id, try to auto-detect it.
            # list_projects needs a PERSONAL key; list_shared_projects works for org keys.
            if not project_id:
                for tool_name in ("list_projects", "list_shared_projects"):
                    try:
                        proj = await session.call_tool(tool_name, arguments={})
                        data = extract(proj)
                        projects = data.get("projects", data) if isinstance(data, dict) else data
                        if isinstance(projects, list) and projects:
                            project_id = projects[0].get("id", "")
                            print(f"  project id (via {tool_name}):", project_id)
                            break
                        print(f"  {tool_name}: {str(data)[:150]}")
                    except Exception as e:
                        print(f"  {tool_name} failed: {e}")

            if not project_id:
                print("  >> Could not auto-detect a project.")
                print("     Paste your project id into NEON_PROJECT_ID at the top of this file")
                print("     (find it at console.neon.tech -> your project -> Settings).")

            if project_id:
                try:
                    # Fetch table AND column names so the LLM knows the real
                    # schema and never guesses a column that doesn't exist.
                    tbl = await session.call_tool("run_sql", arguments={
                        "projectId": project_id,
                        "databaseName": NEON_DB,
                        "sql": "SELECT table_name, column_name "
                               "FROM information_schema.columns "
                               "WHERE table_schema = 'public' "
                               "ORDER BY table_name, ordinal_position",
                    })
                    data = extract(tbl)
                    rows = data.get("rows", data) if isinstance(data, dict) else data
                    schema = {}
                    for r in rows:
                        if isinstance(r, dict) and "table_name" in r:
                            schema.setdefault(r["table_name"], []).append(r.get("column_name", ""))
                    # Build "products(id, name, price); users(id, email)..."
                    tables = "; ".join(f"{t}({', '.join(cols)})"
                                       for t, cols in schema.items()) or "(none yet)"
                    print("  schema:", tables)
                except Exception as e:
                    print("  could not read schema:", e)

            # ── STEP 2 · DECIDE ──────────────────────────────────────────────
            system = (
                "You are a data assistant for a Neon Postgres database. "
                "You MUST call the run_sql tool to answer any question about the data — "
                "never answer from memory, and never ask the user to run SQL themselves. "
                "When a tool result is returned, treat it as true data and answer directly. "
                f"projectId='{project_id}', databaseName='{NEON_DB}'. "
                f"Existing tables: {tables}. Always pass projectId and databaseName to run_sql."
            )
            messages = [
                {"role": "system", "content": system},
                {"role": "user",   "content": prompt},
            ]

            line("[2/4] DECIDE — asking the LLM which tool to call")
            print(f'  Question: "{prompt}"')

            response = llm.chat.completions.create(
                model=MODEL, messages=messages,
                tools=openai_tools,
                # "required" = the model MUST call a tool (it still picks WHICH).
                # This stops chatty models from replying "want me to run this?".
                # To force one specific tool instead, use:
                #   tool_choice={"type": "function", "function": {"name": "run_sql"}}
                tool_choice="required",
            )
            reply      = response.choices[0].message
            tool_calls = reply.tool_calls or []

            if not tool_calls:
                # RESCUE: some local models emit the tool call as TEXT instead of a
                # real tool_call. Recover it two ways:
                #   (a) a JSON blob like {"name":"run_sql","arguments":{...}}
                #   (b) a raw SQL statement or ```sql block
                import re
                text = reply.content or ""
                args = None

                # (a) JSON tool-call blob hiding in the text
                if "{" in text and "}" in text:
                    try:
                        blob = json.loads(text[text.index("{"): text.rindex("}") + 1])
                        args = blob.get("arguments", blob)
                    except Exception:
                        args = None

                # (b) fall back to a raw SQL statement
                if not (isinstance(args, dict) and args.get("sql")):
                    m = (re.search(r"```sql\s*(.+?)```", text, re.S)
                         or re.search(r"(SELECT[\s\S]+?)(?:;|$)", text, re.I))
                    args = {"sql": m.group(1).strip()} if m else None

                if isinstance(args, dict) and args.get("sql") and project_id:
                    args.setdefault("projectId", project_id)
                    args.setdefault("databaseName", NEON_DB)
                    print("  NOTE: the model wrote the call as TEXT, not a real tool call")
                    print("        (a small-model quirk). Running it for you:")
                    print("   ", args["sql"])

                    line("[3/4] EXECUTE — running the model's SQL")
                    result = await session.call_tool("run_sql", arguments=args)
                    out = extract(result)
                    print(" ", str(out)[:500])

                    line("[4/4] SYNTHESIZE — final answer (from your live database)")
                    final = llm.chat.completions.create(model=MODEL, messages=[
                        {"role": "system", "content": "Answer the question directly "
                         "from this query result. No caveats, no disclaimers."},
                        {"role": "user", "content": f"Question: {prompt}\nResult: {out}"},
                    ])
                    print(" ", final.choices[0].message.content)
                    return

                print("  LLM answered without a tool:")
                print(" ", reply.content)
                return

            for tc in tool_calls:
                print("  Tool chosen:", tc.function.name)
                print("  Arguments:  ", json.loads(tc.function.arguments))

            # ── STEP 3 · EXECUTE ─────────────────────────────────────────────
            line("[3/4] EXECUTE — running the tool against your real database")
            messages.append(reply)
            for tc in tool_calls:
                args   = json.loads(tc.function.arguments)
                result = await session.call_tool(tc.function.name, arguments=args)
                text   = "".join(getattr(c, "text", str(c)) for c in result.content)
                print(f"  {tc.function.name} ->")
                print(" ", text[:500])
                messages.append({"role": "tool", "tool_call_id": tc.id, "content": text})

            # ── STEP 4 · SYNTHESIZE ──────────────────────────────────────────
            final = llm.chat.completions.create(model=MODEL, messages=messages)
            line("[4/4] SYNTHESIZE — final answer (from your live database)")
            print(" ", final.choices[0].message.content)


if __name__ == "__main__":
    prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 \
        else "How many rows are in the users table?"
    asyncio.run(run(prompt))
