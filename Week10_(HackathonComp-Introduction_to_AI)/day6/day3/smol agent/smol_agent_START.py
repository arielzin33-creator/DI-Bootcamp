"""
smol_agent_START.py — your STARTING POINT for the smolagents version.

You already built the agent by hand. Now let a framework run the loop.
Follow WORKSHOP_smolagents.md — paste one stage at a time into the marked spot.

BEFORE YOU START:
    pip install "smolagents[litellm]" "mcp[cli]" python-dotenv
    ollama pull qwen2.5:7b
    Terminal 1:  python ../Day1-Build-a-Server/day1_server_full.py   (keep running)
    (Stage 3 only) a .env file with:  NEON_API_KEY=your_key
"""

import os
from dotenv import load_dotenv
load_dotenv()

from smolagents import ToolCallingAgent, LiteLLMModel, MCPClient

# ── settings (already done for you) ──────────────────────────────────────────
LOCAL_SERVER = {"url": "http://127.0.0.1:8000/mcp/", "transport": "streamable-http"}

model = LiteLLMModel(
    model_id="ollama_chat/qwen2.5:7b",
    api_base="http://localhost:11434",
    num_ctx=8192,          # agents pile up tokens fast — keep the window big
)

# MCPClient connects to the server(s) and hands you back their tools.
with MCPClient([LOCAL_SERVER]) as tools:
    print("Tools from the server:", [t.name for t in tools])

    # =====================================================================
    # >>> YOUR CODE GOES HERE  —  paste each STAGE from the guide below  <<<
    # =====================================================================
    print("Connected. Now add Stage 1 from the guide.")
