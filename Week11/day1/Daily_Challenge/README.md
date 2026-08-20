# MCP Weather Demo -- a minimal STDIO tool + resource, no LLM calls

`server.py` (one tool, one resource) and `client.py` (spawns the server, discovers and calls
both), plus `terminal_capture.txt` -- the actual captured run the exercise asks you to submit.

## About the linked Colab notebook

I tried fetching the Colab link directly and it isn't accessible to me -- the page returns only a
Google sign-in prompt, no notebook content. I'm saying that plainly rather than building this and
implying I'd looked at the notebook itself. Everything below is built from the written
instructions, which specify the server/client behavior in enough detail to build and verify
directly -- the same approach (and the same underlying `mcp` version) as the companion "MCP 101"
exercise in this series. If the notebook contains scaffold code that differs from what's here,
this project's behavior -- confirmed by actually running it, not assumed from either the exercise
text or a notebook I couldn't see -- is what to treat as ground truth.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install "mcp[cli]"
```

Verify:

```bash
python --version
mcp --help
```

## Running it

```bash
python client.py
```

Or two terminals, to see server-side errors on their own:

```bash
# Terminal 1
mcp run server.py
# Terminal 2
python client.py
```

## The actual captured output (`terminal_capture.txt`)

```
$ python client.py
Resources: ['list_cities']
Tools: ['get_weather']
2026-08-02 21:12:02,647 [INFO] cities://list read
cities://list ->
London
NYC
Paris
2026-08-02 21:12:02,650 [INFO] get_weather called with city='Paris'
get_weather('Paris') -> {
  "city": "Paris",
  "temp_c": 21,
  "condition": "sunny"
}
2026-08-02 21:12:02,652 [INFO] get_weather called with city='Atlantis'
2026-08-02 21:12:02,652 [INFO] get_weather: 'Atlantis' not found (supported: ['London', 'NYC', 'Paris'])
get_weather('Atlantis') -> {
  "error": "No weather data for 'Atlantis'.",
  "supported_cities": [
    "London",
    "NYC",
    "Paris"
  ]
}
```

The `[INFO]` lines are the server's logging, on stderr -- genuinely interleaved with the client's
own stdout printing in this capture, the same as what you'd see watching a single terminal in
real time. That interleaving is also a working demonstration of *why* the server logs to stderr
specifically: those log lines sitting on stdout instead would have corrupted the actual
STDIO protocol stream the client is parsing, and nothing above would have worked at all.

## Same version note as the companion "MCP 101" exercise

The exercise text says `FastMCP("WeatherDemo")`. The installed `mcp` version -- checked directly,
not assumed -- is **2.0.0**, in which `FastMCP` has been renamed to `MCPServer` with no
backward-compatible alias anywhere in the package. `server.py` uses:

```python
from mcp.server import MCPServer
mcp = MCPServer("WeatherDemo")
```

Everything else (`@mcp.tool()`, `@mcp.resource(...)`, `mcp.run()`) is unchanged from the
exercise's description.

## One contrast worth noting against the companion exercise

`cities://list` has no parameters in its URI -- unlike `greeting://{name}` from the companion
"MCP 101" exercise, which is a *templated* resource. That distinction actually shows up in the
verified output: `cities` appears directly under `Resources: [...]` here, where the templated
greeting resource in the other exercise only appeared under a separate
`list_resource_templates()` call. Both behaviors were confirmed by running each project, not
inferred from the spec -- worth checking directly rather than assuming resource visibility works
uniformly regardless of whether the URI has a parameter in it.

## Design choices

**Static, in-memory weather data, not a live API call.** This exercise is about watching MCP's
request/response flow itself; a real weather API would add network reliability as a second thing
to debug that has nothing to do with what's being practiced here.

**`get_weather` for an unsupported city returns an error dict rather than raising.** The exercise
asks for exactly this ("If city not found, return an error dict"), and `client.py` calls it with
`"Atlantis"` specifically to show that path in the captured output, not just the happy path.

## Troubleshooting

Same as the companion exercise -- see that project's README for the fuller version, including a
real `FileNotFoundError: 'mcp'` gotcha found while testing (running the venv's Python directly
isn't the same as activating the venv; the `mcp` subprocess is resolved via `PATH`).

- `mcp: command not found` -> activate the venv.
- No tools/resources listed -> check the decorators; run `mcp run server.py` directly to see any
  startup error.
- JSON/type issues -> `city` must arrive as a JSON string.
