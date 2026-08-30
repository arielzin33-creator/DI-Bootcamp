# Setup notes

**Version pin required.** A plain `pip install "mcp[cli]"` today installs `mcp==2.0.0`, which
restructured the SDK and removed `mcp.server.fastmcp` entirely — the assignment's scaffold
(`from mcp.server.fastmcp import FastMCP`) will fail with `ModuleNotFoundError` on a fresh
install. Confirmed by actually installing 2.0.0 fresh and hitting the error, then pinning to
`mcp[cli]==1.9.4`, which still has `mcp.server.fastmcp.FastMCP` and matches the exercise's API.

```bash
python -m pip install --upgrade pip
pip install "mcp[cli]==1.9.4"
```

Everything else in the setup instructions (venv creation, `mcp --help`, `mcp run server.py`,
`python client.py`) works as written once this version is pinned.

## Verified run

`client.py` was actually executed end-to-end (client spawning `server.py` over STDIO) — see
`terminal_output.txt` for the real captured output. Summary:

- `Resources: []` — expected, since `greeting://{name}` is a resource **template**, not a
  concrete resource; templates are listed separately.
- `Resource templates: ['greet']`
- `Tools: ['add']`
- `greeting://hello -> Hello, hello!`
- `add(1, 7) -> 8`
