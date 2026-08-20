"""
workshop_agent_START.py — your STARTING POINT for the guided build.

Follow WORKSHOP_Build_the_Agent.md. You will paste ONE stage at a time into the
marked spot below, run it, watch it work, then move to the next stage.

BEFORE YOU START (do this once):
    pip install "mcp[cli]" openai python-dotenv ddgs
    ollama pull qwen2.5:7b
    Terminal 1:  python ../Day1-Build-a-Server/day1_server_full.py   (keep it running!)

    (Optional, for the last stage) make a .env file next to this one:
        NEON_API_KEY=your_key_here
"""

import asyncio
import json
import os
from contextlib import AsyncExitStack

from dotenv import load_dotenv
load_dotenv()

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from openai import OpenAI

# ── settings ─────────────────────────────────────────────────────────────────
LOCAL_URL = "http://127.0.0.1:8000/mcp/"   # your Day 1 server
MODEL     = "qwen2.5:7b"                     # a strong tool-caller
llm = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")


# ── helpers (already written for you — don't worry about these) ──────────────
def to_openai_tool(t):
    """Turn an MCP tool into the shape the model expects."""
    return {"type": "function", "function": {
        "name": t.name, "description": t.description or "", "parameters": t.inputSchema}}


def extract(result):
    """Get the data out of a tool result. Neon's SQL results come back as
    'structuredContent' (a dict); your local tools come back as text.
    (You'll need this in Stage 8 — leave it as-is.)"""
    data = getattr(result, "structuredContent", None)
    if data:
        return data
    parts = getattr(result, "content", None) or getattr(result, "contents", []) or []
    text = "".join(getattr(p, "text", "") for p in parts).strip()
    try:
        return json.loads(text) if text else text
    except Exception:
        return text


def result_text(result):
    """Always return a readable string for the model — works for text results
    (local tools) AND structuredContent results (Neon's run_sql)."""
    parts = getattr(result, "content", None) or getattr(result, "contents", []) or []
    text = "".join(getattr(p, "text", "") for p in parts)
    return text or json.dumps(extract(result))[:2000]


async def main():
    # AsyncExitStack lets us open (and later close) server connections cleanly.
    async with AsyncExitStack() as stack:
        # Open the connection to your Day 1 server.
        r, w, _ = await stack.enter_async_context(streamablehttp_client(LOCAL_URL))
        session = await stack.enter_async_context(ClientSession(r, w))
        await session.initialize()

        # =====================================================================
        # >>> YOUR CODE GOES HERE  —  paste each STAGE from the guide below  <<<
        # =====================================================================
        print("Skeleton is connected. Now add Stage 4 from the guide.")


asyncio.run(main())
