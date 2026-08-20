# Student Exercise — Day 1

**Time:** ~30 minutes  
**Goal:** Add a new tool AND a new resource to `server.py`. Both primitives, working.

---

## Task A — Add a Tool (15 min)

Open `server.py`. Add a third tool below the two that already exist.

Your tool must:
- Have `@mcp.tool()` decorator
- Have a clear docstring (describe what it does AND when to use it)
- Do something useful — fetch data, calculate something, return real information
- Return a string

### Ideas (pick one or invent your own)

**Easy: get_time**
```python
@mcp.tool()
def get_time(city: str = "UTC") -> str:
    """Get the current date and time. Provide a city name or timezone for local time."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    return f"Current UTC time: {now.strftime('%Y-%m-%d %H:%M:%S UTC')}"
```

**Medium: wikipedia_summary**
```python
@mcp.tool()
def wikipedia_summary(topic: str) -> str:
    """Get a short summary of any topic, person, place, or concept from Wikipedia."""
    import urllib.request, urllib.parse, json
    query = urllib.parse.quote(topic)
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{query}"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            data = json.loads(resp.read())
            return data.get("extract", "No summary found.")
    except Exception as e:
        return f"Error: {e}"
```

**Medium: calculate**
```python
@mcp.tool()
def calculate(expression: str) -> str:
    """Evaluate a mathematical expression and return the result. Example: '2 + 2 * 10'"""
    try:
        result = eval(expression, {"__builtins__": {}}, {})
        return f"{expression} = {result}"
    except Exception as e:
        return f"Cannot evaluate '{expression}': {e}"
```

**Hard: your own idea**  
Fetch from any free API (Open-Meteo, REST Countries, etc.) and return the result as a string.

### After Adding Your Tool

1. **Restart the server** (Ctrl+C, then `python server.py` again)
2. Run `python client.py` — your tool won't be called automatically, but you'll see it listed in the discovered tools panel. That's discovery working.
3. Can you describe in one sentence what this tool does and when the LLM should use it?

---

## Task B — Add a Resource (15 min)

Now add a resource to `server.py`. A resource is data the host application reads at startup — the LLM doesn't decide to fetch it, the host loads it automatically.

Add this below your tool:

```python
@mcp.resource("workshop://about")
def about_me() -> str:
    """A short description of who built this server and what it does."""
    return "This MCP server was built by [your name] during the MCP workshop. It can [describe your tools]."
```

Restart the server. Test it:

```python
import asyncio
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

async def test():
    async with streamablehttp_client("http://127.0.0.1:8000/mcp/") as (r, w, _):
        async with ClientSession(r, w) as s:
            await s.initialize()
            result = await s.read_resource("workshop://about")
            print(result.contents[0].text)

asyncio.run(test())
```

**Key question:** What's the difference between `read_file("notes.txt")` (a tool) and `workshop://about` (a resource)?

*(Answer: `read_file` is a tool — the LLM decides when to call it. The resource is read by the host app automatically, before the user types anything. Same idea, different controller: tools are LLM-controlled, resources are host-controlled.)*

---

## Bonus: Two tools that chain together

Write a second tool and try to make the LLM use both in one answer.

Example: `get_weather` + `get_time` together can answer "What's the weather in London right now, and what time is it there?"

Ask the LLM a question that needs both your tools. Does it call them in sequence?

*(Note: you need Day 2's `client.py` to test this — today's client has no LLM. Come back here after Day 2.*

*Answer: yes, the LLM calls them in sequence. It calls the first tool, reads the result, then decides the second tool is also needed and calls that. Each result becomes part of the conversation — the LLM "sees" the weather before it decides to also fetch the time. This is the TAO loop running twice: Think → call get_weather → Observe result → Think → call get_time → Observe result → final answer. The LLM is not executing anything — it is deciding, step by step, what to ask the client to do.)*

---

## Bonus: Connect Goose

Goose is a free desktop chat app that connects to any MCP server. Skip `client.py` entirely — just open Goose and chat.

**Install:** download from `block.github.io/goose`

**Step 1 — Set the model to qwen3:8b**

Goose's default model is too small for tool calling. Connect it to your local Ollama:
1. Open Goose → click **Connect to a Provider**
2. Find **Ollama** → click **Configure**
3. **Ollama Host:** `localhost` — leave as-is → click **Submit**
4. Select model: `qwen3:8b`

**Step 2 — Add the MCP extension**

**Config** — edit `C:\Users\<your-name>\.config\goose\config.yaml`:
```yaml
extensions:
  workshop:
    enabled: true
    name: workshop
    type: stdio
    cmd: python
    args:
      - "C:\\full\\path\\to\\server.py"
    envs: {}
```
Replace the path with the actual path to your `server.py`.

**Or via Goose UI:** Settings → Extensions → Add custom extension:
- Extension Name: `Workshop`
- Type: `STDIO`
- Command: `python C:\full\path\to\server.py` *(python and path in one field)*

**Test it:**
- "What's in notes.txt?"
- "What's the weather in London?"
- A question that needs the tool you added in Task A.

**What's different from `client.py`:** You don't run the server yourself. Goose spawns `server.py` as a subprocess and the server switches to STDIO transport automatically. Same tools, different connection path.

**Key observation:** The server you built in 35 minutes of class is now powering a real chat interface. This is the N+M protocol point: build your server once, connect any client.
