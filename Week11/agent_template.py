"""
agent_template.py — a reusable TEMPLATE for building AI agents on LOCAL LLMs.

This is the Day 3 workshop agent, generalised. Nothing here is specific to the
weather/Wikipedia demo — you point it at your own MCP server(s), write your own
system prompt, and it runs the same DISCOVER → DECIDE → EXECUTE → SYNTHESIZE
loop the course taught, on a model running on your own machine.

    You edit ONLY the CONFIG block (section 1).
    Everything below it is machinery you can leave alone.

────────────────────────────────────────────────────────────────────────────────
BEFORE RUNNING
    pip install "mcp[cli]" openai python-dotenv
    ollama pull qwen2.5:7b          # or any tool-calling model you have
    Terminal 1:  python your_server.py     (keep it running)
    Terminal 2:  python agent_template.py

    Secrets go in a .env file next to this one — never in this file.
────────────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from contextlib import AsyncExitStack

from dotenv import load_dotenv

load_dotenv()

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from openai import OpenAI


# ══════════════════════════════════════════════════════════════════════════════
# 1 · CONFIG — this is the only part you edit
# ══════════════════════════════════════════════════════════════════════════════

# ── The local model that does the DECIDING ───────────────────────────────────
# Tool-calling is a skill; not every local model has it. Known-good on Ollama:
#   qwen2.5:7b   — the course default, very steady tool caller
#   qwen3:8b     — newer, also strong
#   glm4:9b      — good, slightly chattier
#   mistral:7b   — workable
#   llama3.2:3b  — fast but fumbles multi-step chains; fine for one tool
# If the agent keeps answering instead of calling tools, change THIS first.
MODEL = os.environ.get("AGENT_MODEL", "qwen2.5:7b")
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/v1")

# ── The servers this agent connects to ───────────────────────────────────────
# One entry per MCP server. The agent merges every server's tools into one list
# and remembers who owns each one, so the model never knows they live apart.
#   name    : label for the trace output
#   url     : streamable-HTTP endpoint
#   headers : auth headers, or None
#   tools   : None = take every tool; or a list of names to take only those
#   enabled : skip this server entirely when False
SERVERS = [
    {
        "name": "local",
        "url": "http://127.0.0.1:8000/mcp/",
        "headers": None,
        "tools": None,
        "enabled": True,
    },
    # ── Example second server (a cloud DB). Uncomment and set NEON_API_KEY. ──
    # {
    #     "name": "neon",
    #     "url": "https://mcp.neon.tech/mcp",
    #     "headers": {"Authorization": f"Bearer {os.environ.get('NEON_API_KEY', '')}"},
    #     "tools": ["run_sql"],
    #     "enabled": bool(os.environ.get("NEON_API_KEY")),
    # },
]

# ── The agent's instructions ─────────────────────────────────────────────────
# Say WHAT it is, WHEN to reach for tools, and HOW to answer. Keep it short —
# the real steering happens in each tool's docstring, on the server.
SYSTEM_PROMPT = """You are a helpful assistant with access to tools.

Use a tool whenever the question needs live, local, or private data — do not
guess. When a tool returns a result, use that result and answer directly.
If a tool fails, say so plainly instead of inventing an answer.
Answer in a few clear sentences unless asked for more."""

# ── Resources to PUSH into context at startup ────────────────────────────────
# Remember the split: the model PULLS tools; your APP PUSHES resources. Any URI
# listed here is read once at startup and prepended to the chat as context.
#   e.g. ["notes://today"]
PRELOAD_RESOURCES: list[str] = []

# ── Arguments the APP supplies, never the model ──────────────────────────────
# Connection details, project ids, tenant ids, paths, keys. The model should
# never see or guess these. Filled in at runtime by on_connect() if dynamic.
#   e.g. {"run_sql": {"projectId": "...", "databaseName": "neondb"}}
ARG_INJECTORS: dict[str, dict] = {}

MAX_ROUNDS = 6      # tool calls the agent may chain before it must answer
MAX_HISTORY = 40    # messages kept in memory (older turns are dropped)
VERBOSE = True      # print every tool call and result


async def on_connect(sessions: dict, tools_by_name: dict) -> str:
    """Runs once, after every server is connected, before the chat starts.

    Use it for setup the MODEL should not have to do: look up an id, read a
    database schema, check a path exists. Return any extra text you want
    appended to the system prompt (or "" for none).

    `sessions`      : {server name -> ClientSession}
    `tools_by_name` : {tool name  -> ClientSession that owns it}
    """
    # ── Example: discover the Neon project id + schema, then inject them ─────
    # neon = sessions.get("neon")
    # if neon:
    #     data = extract(await neon.call_tool("list_projects", arguments={}))
    #     projects = data.get("projects", data) if isinstance(data, dict) else data
    #     pid = projects[0]["id"] if projects else ""
    #     ARG_INJECTORS["run_sql"] = {"projectId": pid, "databaseName": "neondb"}
    #     rows = extract(await neon.call_tool("run_sql", arguments={
    #         **ARG_INJECTORS["run_sql"],
    #         "sql": "SELECT table_name, column_name FROM information_schema.columns"
    #                " WHERE table_schema='public' ORDER BY table_name, ordinal_position"}))
    #     rows = rows.get("rows", rows) if isinstance(rows, dict) else rows
    #     cols: dict[str, list[str]] = {}
    #     for r in rows:
    #         if isinstance(r, dict) and "table_name" in r:
    #             cols.setdefault(r["table_name"], []).append(r.get("column_name", ""))
    #     return " Database tables: " + "; ".join(
    #         f"{t}({', '.join(c)})" for t, c in cols.items())
    return ""


# ══════════════════════════════════════════════════════════════════════════════
# 2 · MACHINERY — you can leave everything below this line alone
# ══════════════════════════════════════════════════════════════════════════════

llm = OpenAI(base_url=OLLAMA_URL, api_key="ollama")


def to_openai_tool(t) -> dict:
    """Turn an MCP tool into the shape the model expects."""
    return {
        "type": "function",
        "function": {
            "name": t.name,
            "description": t.description or "",
            "parameters": t.inputSchema,
        },
    }


def extract(result):
    """Get the DATA out of a tool result — dict if structured, else text."""
    data = getattr(result, "structuredContent", None)
    if data:
        return data
    parts = getattr(result, "content", None) or getattr(result, "contents", []) or []
    text = "".join(getattr(p, "text", "") for p in parts).strip()
    try:
        return json.loads(text) if text else text
    except Exception:
        return text


def result_text(result) -> str:
    """Always return a readable STRING for the model."""
    parts = getattr(result, "content", None) or getattr(result, "contents", []) or []
    text = "".join(getattr(p, "text", "") for p in parts)
    return text or json.dumps(extract(result))[:2000]


def salvage_tool_call(content: str, known: set[str]):
    """Safety net for small models that TYPE a tool call instead of calling it.

    A 3B model will sometimes reply with the literal text
    {"name": "get_weather", "arguments": {"city": "Tel Aviv"}}
    instead of using the tool-call channel. Rather than showing the user that
    JSON, we try to read it and run the tool for real. Returns (name, args) or
    None. Bigger models never hit this path.
    """
    if not content:
        return None
    start, end = content.find("{"), content.rfind("}")
    if start == -1 or end <= start:
        return None
    try:
        blob = json.loads(content[start : end + 1])
    except Exception:
        return None
    name = blob.get("name") or blob.get("tool") or blob.get("function")
    if isinstance(name, dict):
        name = name.get("name")
    if name not in known:
        return None
    args = blob.get("arguments") or blob.get("parameters") or {}
    if isinstance(args, str):
        try:
            args = json.loads(args)
        except Exception:
            args = {}
    return (name, args) if isinstance(args, dict) else None


def trim(messages: list[dict]) -> list[dict]:
    """Keep memory bounded WITHOUT orphaning tool messages.

    A local model's context is small, so old turns have to go. But an
    assistant-with-tool_calls and its matching tool results are one unit — cut
    between them and the API rejects the request. So we only ever cut at a
    'user' message boundary.
    """
    if len(messages) <= MAX_HISTORY:
        return messages
    system, rest = messages[0], messages[1:]
    keep = rest[-MAX_HISTORY:]
    while keep and keep[0].get("role") != "user":
        keep.pop(0)
    return [system] + keep


def say(*args):
    if VERBOSE:
        print(*args)


async def connect_all(stack: AsyncExitStack):
    """Open every enabled server, merge their tools, remember who owns what."""
    sessions: dict[str, ClientSession] = {}
    owner: dict[str, ClientSession] = {}
    all_tools: list[dict] = []

    for spec in SERVERS:
        if not spec.get("enabled", True):
            continue
        name = spec["name"]
        try:
            r, w, _ = await stack.enter_async_context(
                streamablehttp_client(spec["url"], headers=spec.get("headers"))
            )
            session = await stack.enter_async_context(ClientSession(r, w))
            await session.initialize()
        except Exception as e:
            print(f"  ! could not connect to '{name}' ({spec['url']}): {e}")
            continue

        sessions[name] = session
        wanted = spec.get("tools")
        taken = []
        for t in (await session.list_tools()).tools:
            if wanted is not None and t.name not in wanted:
                continue
            if t.name in owner:
                print(f"  ! tool name collision: '{t.name}' — '{name}' wins")
            owner[t.name] = session
            all_tools.append(to_openai_tool(t))
            taken.append(t.name)
        say(f"  connected '{name}' → {len(taken)} tool(s): {', '.join(taken) or '(none)'}")

    return sessions, owner, all_tools


async def preload(sessions: dict) -> str:
    """Read the configured resources and return them as one context block."""
    chunks = []
    for uri in PRELOAD_RESOURCES:
        for name, session in sessions.items():
            try:
                res = await session.read_resource(uri)
                chunks.append(f"[{uri}]\n{result_text(res)}")
                say(f"  loaded resource {uri} from '{name}'")
                break
            except Exception:
                continue
        else:
            print(f"  ! no server could serve resource {uri}")
    return "\n\n".join(chunks)


async def run_tool(name: str, args: dict, owner: dict, session_fallback) -> str:
    """EXECUTE — route the call to the server that owns it, inject app args."""
    args = {**args, **ARG_INJECTORS.get(name, {})}
    session = owner.get(name, session_fallback)
    say(f"  [tool] {name}({json.dumps(args)[:200]})")
    try:
        result = await session.call_tool(name, arguments=args)
    except Exception as e:
        # Never raise into the loop — hand the model a readable error so it can
        # recover (retry with different arguments, or explain the failure).
        text = f"Tool '{name}' failed: {e}"
        say(f"  [err ] {text}")
        return text
    text = result_text(result)
    say(f"  [ ok ] {text[:300]}{'…' if len(text) > 300 else ''}")
    return text


async def agent_turn(messages: list[dict], all_tools: list[dict], owner: dict, fallback):
    """One user turn: DECIDE → EXECUTE → repeat → SYNTHESIZE.

    This is the whole agent. It loops because a real question often needs one
    tool's result to choose the next tool. It stops when the model replies
    without asking for a tool — that is the model deciding it is done.
    """
    known = {t["function"]["name"] for t in all_tools}

    for round_no in range(MAX_ROUNDS):
        kwargs = {"model": MODEL, "messages": trim(messages)}
        if all_tools:
            kwargs |= {"tools": all_tools, "tool_choice": "auto"}

        try:
            msg = llm.chat.completions.create(**kwargs).choices[0].message
        except Exception as e:
            print(f"Agent: the model call failed — {e}\n")
            return

        calls = msg.tool_calls or []

        # Safety net: the model typed a tool call as plain text.
        if not calls:
            salvaged = salvage_tool_call(msg.content or "", known)
            if salvaged:
                name, args = salvaged
                say(f"  [salvaged a typed tool call: {name}]")
                messages.append({"role": "assistant", "content": None,
                                 "tool_calls": [{"id": "salvaged", "type": "function",
                                                 "function": {"name": name,
                                                              "arguments": json.dumps(args)}}]})
                text = await run_tool(name, args, owner, fallback)
                messages.append({"role": "tool", "tool_call_id": "salvaged", "content": text})
                continue

            # No tool wanted → this is the answer. SYNTHESIZE, and stop.
            messages.append({"role": "assistant", "content": msg.content})
            print("Agent:", msg.content, "\n")
            return

        # The model asked for tools. Record its turn exactly as sent.
        messages.append({
            "role": "assistant",
            "content": msg.content,
            "tool_calls": [
                {"id": tc.id, "type": "function",
                 "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                for tc in calls
            ],
        })

        for tc in calls:
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                # Small models emit malformed JSON sometimes. Tell the model,
                # don't crash — it will usually fix itself next round.
                messages.append({"role": "tool", "tool_call_id": tc.id,
                                 "content": f"Invalid JSON arguments: {tc.function.arguments}"})
                continue
            text = await run_tool(tc.function.name, args, owner, fallback)
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": text})

    # Ran out of rounds. Force a final answer with no tools offered.
    messages.append({"role": "user",
                     "content": "Stop using tools and answer with what you have."})
    try:
        final = llm.chat.completions.create(model=MODEL, messages=trim(messages))
        answer = final.choices[0].message.content
    except Exception as e:
        answer = f"(hit the {MAX_ROUNDS}-round limit and the final call failed: {e})"
    messages.append({"role": "assistant", "content": answer})
    print("Agent:", answer, "\n")


async def main():
    print(f"\nmodel: {MODEL}  ·  via {OLLAMA_URL}")
    print("connecting…")

    async with AsyncExitStack() as stack:
        sessions, owner, all_tools = await connect_all(stack)

        if not sessions:
            print("\nNo servers connected. Is your MCP server running?")
            print("  Terminal 1:  python your_server.py")
            return
        if not all_tools:
            print("\nConnected, but no tools were offered. The agent can still chat.")

        context = await preload(sessions)
        extra = await on_connect(sessions, owner) or ""

        system = SYSTEM_PROMPT + extra
        if context:
            system += "\n\nBackground context you have been given:\n" + context

        messages: list[dict] = [{"role": "system", "content": system}]

        print(f"\n{len(all_tools)} tool(s) ready. Type 'quit' to exit.\n")
        while True:
            try:
                user = input("You: ").strip()
            except (EOFError, KeyboardInterrupt):
                print()
                break
            if not user:
                continue
            if user.lower() in ("quit", "exit", "q"):
                break
            messages.append({"role": "user", "content": user})
            await agent_turn(messages, all_tools, owner, next(iter(sessions.values())))


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(0)
