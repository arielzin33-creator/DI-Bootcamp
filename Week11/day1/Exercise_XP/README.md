# MCP 101 — a tiny local MCP server + client

Two files, exactly as the exercise specifies: `server.py` (one tool, one resource) and
`client.py` (spawns the server over STDIO and exercises both).

## Setup

macOS / Linux:

```bash
mkdir mcp-101 && cd mcp-101
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install "mcp[cli]"
```

Windows (PowerShell):

```powershell
mkdir mcp-101; cd mcp-101
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install "mcp[cli]"
```

Verify:

```bash
python --version
mcp --help
```

## Running it

One terminal (client spawns the server itself):

```bash
python client.py
```

Or two terminals, for debugging server startup issues separately:

```bash
# Terminal 1
mcp run server.py
# Terminal 2
python client.py
```

**Worth knowing about the two-terminal mode:** MCP's STDIO transport is inherently a
spawned-subprocess model, not a listening server multiple clients connect to — `client.py`
always spawns its *own* `mcp run server.py` subprocess (see `StdioServerParameters` in
`client.py`) regardless of whether another copy happens to be running in a second terminal. The
two-terminal setup doesn't change what the client connects to; it's genuinely useful for exactly
what the exercise says — running the server on its own first, so any startup error (an import
error, a decorator typo) shows up directly in that terminal instead of surfacing as an opaque
"Connection closed" from the client.

## Verified output

```
$ python client.py
Resources: []
Resource templates: ['greet']
Tools: ['add']
greeting://hello -> Hello, hello!
add(1, 7) -> 8
```

That `Resources: []` next to `Resource templates: ['greet']` is expected, not a bug — see below.

## A real, version-breaking problem, found and fixed

The exercise's own scaffold imports `from mcp.server.fastmcp import FastMCP`. As of the `mcp`
version this was actually built and tested against — **2.0.0**, confirmed via
`pip index versions mcp` rather than assumed — that import fails outright:

```
ModuleNotFoundError: No module named 'mcp.server.fastmcp'
```

`FastMCP` has been renamed to `MCPServer`, with no backward-compatible alias left behind
anywhere in the package (checked directly: `grep -rl "FastMCP"` across the entire installed
`mcp` package returns nothing). The fix used throughout this project:

```python
from mcp.server import MCPServer
mcp = MCPServer("Demo")
```

Everything else about the exercise's scaffold is unchanged in this version — the `@mcp.tool()`
and `@mcp.resource(...)` decorators, and calling `mcp.run()` (which defaults to
`transport="stdio"`) to start the loop, all work exactly as written. Only the class's name and
import path moved. If you're following this exercise with an older `mcp` (1.x) installed,
`from mcp.server.fastmcp import FastMCP` is the original, correct import for that version —
check `pip show mcp` first rather than assuming either name is right.

## Why `Resources: []` is correct, not a missed feature

`greeting://{name}` is a **templated** resource — it has a parameter, `{name}`, rather than
being one fixed, ready-to-read URI. The MCP protocol keeps templated and concrete resources in
two separate lists: `list_resources()` only returns concrete resources with no parameters to
fill in, and `list_resource_templates()` returns the parameterized ones. This was confirmed by
actually running the client (not assumed from the spec): `list_resources()` genuinely does
return an empty list for this server, and `greet` (the resource's function name, since no
explicit `name=` was set in the decorator) only shows up under `list_resource_templates()`.
`client.py` calls and prints both, so the "greeting" resource is actually visible somewhere in
the discovery output — printing only `list_resources()`, as the exercise's literal wording
("List resources... print their names") might suggest on a first read, would make it look like
the server has no resource at all.

## Troubleshooting (from the exercise, confirmed accurate, plus one more found here)

- `mcp: command not found` -> activate your venv (`.venv/bin/mcp` / `.venv\Scripts\mcp.exe`
  directly if activation itself isn't working).
- No tools/resources visible -> check the decorators, and try `mcp run server.py` directly to
  see any startup error.
- Type mismatch calling `add` -> both `a` and `b` need to arrive as JSON integers, not strings.
- "Connection closed" from the client -> run `mcp run server.py` in a second terminal; a
  server-side exception (like the `FastMCP` import error above) will print there directly
  instead of being swallowed into that generic client-side message.
- **`FileNotFoundError: [Errno 2] No such file or directory: 'mcp'` when running `client.py`** —
  found while re-verifying this project, not hypothetical: running the venv's own Python
  interpreter directly (`.venv/bin/python client.py`) is *not* the same as activating the venv.
  `client.py` spawns `mcp run server.py` as a subprocess, and that subprocess is found via the
  OS's `PATH` — which only has the venv's `bin/` directory on it once you've actually run
  `source .venv/bin/activate` (or the PowerShell equivalent), regardless of which Python
  interpreter you happen to be invoking `client.py` with. If you're scripting this or invoking
  it from an editor's "run" button rather than an activated shell, make sure the venv's `bin/`
  (or `Scripts/` on Windows) is genuinely on `PATH`, not just selected as the interpreter.
