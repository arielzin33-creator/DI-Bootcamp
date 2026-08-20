"""
day1_server_full.py — Day 1: your first MCP server, built step by step.

The file is organized in the exact order you build it in class.
Read Day1_StepByStep.md alongside — every step is explained there.

BEFORE RUNNING (see Day1_StepByStep.md §0):
    pip install "mcp[cli]" requests
    python -c "import mcp; print('mcp OK')"

RUN:
    python day1_server_full.py
        → from a terminal: HTTP mode at http://127.0.0.1:8000/mcp/
        → launched by Goose / Claude Desktop: STDIO mode, automatically

WHAT IT EXPOSES (the three MCP primitives — three, not four):
    Tools     (LLM calls these):      read_file, get_weather
    Resource  (host reads this):      notes://today
    Prompt    (user triggers it):     summarize
"""

import sys
from pathlib import Path

# ── STEP 1 · The skeleton ────────────────────────────────────────────────────
# One import, one line. "Workshop" is the server name every client displays.
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Workshop")


# ── STEP 3 · First tool: read the machine ────────────────────────────────────
# The pattern of EVERY tool: decorator · docstring · body · return a string.
# The docstring is NOT documentation — it is the prompt the LLM reads when
# deciding whether to call this tool. Write it like prompt engineering.
@mcp.tool()
def read_file(filename: str) -> str:
    """Read any text file from the current directory and return its full contents."""
    path = Path(__file__).parent / filename
    if not path.exists():
        # Return a useful STRING, never raise — the LLM can read errors and react.
        return f"File not found: {filename}"
    return path.read_text(encoding="utf-8")


# ── STEP 4 · Second tool: reach the live world ───────────────────────────────
# wttr.in: free weather, no API key, no signup. format=3 → one line of text.
@mcp.tool()
def get_weather(city: str) -> str:
    """Get the current weather conditions and temperature for any city in the world."""
    # import INSIDE the function = isolation: if requests is missing,
    # only this tool fails — the server still starts and other tools work.
    import requests
    try:
        r = requests.get(f"https://wttr.in/{city}?format=3", timeout=5)
        r.raise_for_status()
        return r.text.strip()          # e.g. "Tel Aviv: +28°C"
    except Exception as e:
        return f"Weather unavailable: {e}"

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
    
    
# ── STEP 5 · A Resource: data with an address ────────────────────────────────
# The LLM does NOT call this. The HOST reads it (usually at startup) and puts
# it into the model's context. Tools are verbs; resources are nouns.
@mcp.resource("notes://today")
def today_notes() -> str:
    """Workshop notes for today. A host app like Goose reads this on startup
    to give the LLM background context without the user having to ask."""
    path = Path(__file__).parent / "notes.txt"
    if not path.exists():
        return "No notes found."
    return path.read_text(encoding="utf-8")


# ── STEP 6 · A Prompt: a workflow the USER triggers by name ──────────────────
# In a client like Goose the user picks "summarize" from a menu; the returned
# text is sent to the LLM as if the user typed it. Note: it references the
# read_file tool by name — the primitives compose.
@mcp.prompt(name="summarize")
def summarize_prompt(filename: str) -> str:
    """Prompt template: instructs the LLM to read a file and summarize it."""
    return (
        f"Please read the file '{filename}' using the read_file tool, "
        f"then write a brief, clear summary of its contents."
    )


# ── STEP 2 · The run block: one file, two transports, zero config ────────────
# isatty() is True when YOU run it from a terminal  → Streamable HTTP (port 8000)
# isatty() is False when a host spawns it as a pipe → STDIO
# (SSE is deprecated; Streamable HTTP is the modern remote transport.)
if __name__ == "__main__":
    if sys.stdin.isatty():
        print("Server starting → http://127.0.0.1:8000/mcp/", file=sys.stderr)
        mcp.run(transport="streamable-http")
    else:
        mcp.run()
