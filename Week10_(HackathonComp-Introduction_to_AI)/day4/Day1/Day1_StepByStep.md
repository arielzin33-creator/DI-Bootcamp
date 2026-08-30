# Day 1 — Build an MCP Server · Step by Step

> Companion file: **`day1_server_full.py`** — the complete, runnable result of this walkthrough.
> Follow this document top to bottom; every snippet is explained, then assembled.

---

## 0 · Before you start — install & check

Run every check. If one fails, fix it BEFORE class — the first command of class assumes all of this works.

### Install

```bash
# 1. Python 3.10+ (check first — you probably have it)
python --version

# 2. The MCP SDK with FastMCP + CLI tools
pip install "mcp[cli]"

# 3. requests — used by the weather tool
pip install requests

# 4. Ollama (for the failure demo) — https://ollama.com/download
ollama --version
```

### Verify (the exact minute-one class check)

```bash
python -c "import mcp; print('mcp OK')"
python -c "import requests; print('requests OK')"
ollama --version
```

All three answer? You're ready.

| Check fails | Fix |
|---|---|
| `No module named mcp` | `pip install "mcp[cli]"` — and confirm you installed into the same Python you're running |
| `ollama: command not found` | Close + reopen terminal (PATH refresh). Windows: use PowerShell, not CMD |
| Corporate proxy blocks pip | `pip install --proxy http://<proxy> "mcp[cli]"` or ask before class |

---

## 1 · The idea in one paragraph

An LLM knows only its training data — nothing on your machine, nothing live, nothing after its cutoff. An **MCP server** is a small Python file that exposes *capabilities* (tools, resources, prompts) through a standard protocol, so any LLM host (Claude Desktop, Goose, your own script) can discover and use them. Today you build one.

Three roles to keep straight (a popular video gets this wrong):

- **HOST** — the app with the chat window (Claude Desktop, Goose, your script).
- **CLIENT** — the connector *inside* the host that speaks MCP. **The client is NOT the language model.**
- **SERVER** — your Python file. That's what we build today.

And **three primitives** a server can offer — three, not four ("context" is not a primitive; it's the *result* these three deliver into the model's context window):

| Primitive | Who uses it | Example today |
|---|---|---|
| **Tool** | the LLM calls it | `read_file`, `get_weather` |
| **Resource** | the host reads it | `notes://today` |
| **Prompt** | the user triggers it | `summarize` |

---

## 2 · Step-by-step build

### Step 1 — the skeleton (2 lines of real code)

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Workshop")
```

**Explanation.** `FastMCP` is the framework. One line creates a server. The name `"Workshop"` is what every connecting client will display. At this point the server runs — but offers nothing.

### Step 2 — the run block (transports, automatic)

```python
import sys

if __name__ == "__main__":
    if sys.stdin.isatty():
        print("Server starting → http://127.0.0.1:8000/mcp/", file=sys.stderr)
        mcp.run(transport="streamable-http")
    else:
        mcp.run()
```

**Explanation.** One file, two transports, zero configuration:

- `sys.stdin.isatty()` is True when *you* run it from a terminal → **Streamable HTTP** mode, listening on port 8000. (SSE is deprecated — Streamable HTTP is the remote story.)
- When a host like Goose or Claude Desktop launches your server as a subprocess, stdin is a pipe, `isatty()` is False → **STDIO** mode.

Run it now: `python day1_server_full.py` → "Server starting". No tools yet.

### Step 3 — first tool: `read_file`

```python
from pathlib import Path

@mcp.tool()
def read_file(filename: str) -> str:
    """Read any text file from the current directory and return its full contents."""
    path = Path(__file__).parent / filename
    if not path.exists():
        return f"File not found: {filename}"
    return path.read_text(encoding="utf-8")
```

**Explanation, line by line.**

- `@mcp.tool()` — the decorator. It *registers* the function with FastMCP without changing it. Flask users: this is `@app.route()` for LLMs.
- **The docstring is not documentation — it is a prompt.** It's the exact text the LLM reads when deciding whether to call this tool. Vague docstring → wrong calls. This is prompt engineering.
- Type hints (`filename: str`, `-> str`) become the tool's JSON schema automatically.
- Return a **string** — always. The LLM reads text.
- The `File not found` branch returns a *useful string* instead of raising — the LLM can read the error and react.

### Step 4 — second tool: `get_weather` (live data)

```python
@mcp.tool()
def get_weather(city: str) -> str:
    """Get the current weather conditions and temperature for any city in the world."""
    import requests
    try:
        r = requests.get(f"https://wttr.in/{city}?format=3", timeout=5)
        r.raise_for_status()
        return r.text.strip()          # e.g. "Tel Aviv: ⛅️ +28°C"
    except Exception as e:
        return f"Weather unavailable: {e}"
```

**Explanation.**

- wttr.in — free, no API key, no signup. `format=3` returns one line.
- **Why is `import requests` inside the function?** Isolation. If the import were at the top and `requests` weren't installed, the *whole server* would crash at startup. Inside the function, only this one tool fails.
- `timeout=5` — never let a tool hang the loop.
- The `except` returns a string, same reasoning as Step 3.

### Step 5 — a Resource (the host reads it, not the LLM)

```python
@mcp.resource("notes://today")
def today_notes() -> str:
    """Workshop notes for today. A host app reads this on startup to give the
    LLM background context without the user having to ask."""
    path = Path(__file__).parent / "notes.txt"
    if not path.exists():
        return "No notes found."
    return path.read_text(encoding="utf-8")
```

**Explanation.** A resource is *data with an address* (`notes://today` is a URI you invent). The LLM does not call it — the **host** chooses to read it, typically at startup, and injects it into context. Tools = verbs, resources = nouns.

### Step 6 — a Prompt (the user triggers it)

```python
@mcp.prompt(name="summarize")
def summarize_prompt(filename: str) -> str:
    """Prompt template: instructs the LLM to read a file and summarize it."""
    return (
        f"Please read the file '{filename}' using the read_file tool, "
        f"then write a brief, clear summary of its contents."
    )
```

**Explanation.** A prompt is a *reusable workflow template*. In a client like Goose, the user picks "summarize" from a menu, supplies `filename`, and the returned text is sent to the LLM as if the user typed it. Note how it references the tool by name — primitives compose.

---

## 3 · Run it — and PROVE it runs (no LLM needed)

An MCP server does **nothing visible on its own** — it starts and *waits* for a client. So "it runs" needs proof. Here are four ways, easiest to most impressive. Use two terminal windows side by side.

### ⚠️ Read this first — the #1 gotcha

Run the server in a **real, foreground terminal window**. If you launch it in the background (`python day1_server_full.py &`) or pipe its output, `sys.stdin.isatty()` is **False** — so the server silently starts in **STDIO mode** with *no web server*, and nothing can connect to port 8000. Foreground terminal = HTTP mode = what you want today.

### Way 1 — the startup line (5 seconds)

**Terminal 1:**

```bash
python day1_server_full.py
```

You should see:

```
Server starting → http://127.0.0.1:8000/mcp/
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

Then it just sits there. **That is not frozen — that is waiting.** A server's whole job is to wait for a client. Leave it running.

### Way 2 — prove the port is alive (10 seconds)

**Terminal 2:**

```bash
curl -i http://127.0.0.1:8000/mcp/
```

You get an HTTP response back (a status like `307` / `406` — a *wrong-method* answer, not silence). Something answered → the door exists. Silence / "connection refused" → the server isn't running (see the gotcha above).

### Way 3 — the real proof: run the probe (30 seconds)  ⭐

`prove_it_runs.py` (in this folder) is a tiny client — no LLM. It connects, lists the tools, and calls each one.

**Terminal 2:**

```bash
python prove_it_runs.py
```

Expected output:

```
Connected. The server offers 2 tool(s):
   - read_file: Read any text file from the current directory and return its full contents.
   - get_weather: Get the current weather conditions and temperature for any city in the world.

Calling read_file("notes.txt") ...
   -> MCP workshop — Day 1. If you can read this, read_file works!

Calling get_weather("Tel Aviv") ...
   -> Tel Aviv: +28°C
```

Your two tools, called for real, returning real data — and there's no LLM anywhere yet. **Teaching move:** watch Terminal 1 while this runs — the waiting server suddenly logs the incoming request. That cause-and-effect across two windows is the moment "client and server" clicks.

### Way 4 — the visual inspector (best on a projector)

```bash
npx @modelcontextprotocol/inspector python day1_server_full.py
```

A browser UI opens listing your 2 tools, 1 resource, 1 prompt — each with a **Run** button. Click `read_file`, type `notes.txt`, watch it return. Zero code, fully interactive. That tool listing is literally Step 1 of tomorrow's loop ("discover").

> Note: `prove_it_runs.py` needs `notes.txt` to exist next to the server. If it's missing, create it: `echo "Hello from Day 1" > notes.txt`.

---

## 4 · The pattern (memorize this, forget the rest)

Every tool you will ever write:

1. `@mcp.tool()` on top
2. Docstring that tells the LLM **when** to use it (prompt engineering!)
3. Function body — **one** specific thing
4. Return a string

---

## 5 · Troubleshooting

| Symptom | Cause → fix |
|---|---|
| `Address already in use` | Old server still running → kill it (Ctrl+C in its terminal) |
| Changed code, nothing changed | **Servers must be restarted** — code is read at startup |
| Tool missing in client | Same — restart the server |
| `File not found: notes.txt` | Create `notes.txt` next to the server file |
| Weather returns error | Network/proxy blocks wttr.in — the tool degrades gracefully; that's by design |
