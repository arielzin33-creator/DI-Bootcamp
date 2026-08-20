# HTTP / Streamable HTTP in MCP -- progress notifications, one final result

`server_stream.py` (a long-running tool reporting structured progress) and `client_stream.py`
(connects over Streamable HTTP, shows progress as it arrives, then the final result), plus
`terminal_capture.txt` -- a real captured run.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install "mcp[cli]"
```

## Running it

Two terminals -- Streamable HTTP is a real listening server, not a spawned-per-client subprocess
like STDIO, so (unlike the two companion STDIO-based MCP exercises in this series) the server
needs to actually be running before the client connects:

```bash
# Terminal 1
python server_stream.py
# Terminal 2
python client_stream.py
```

## The real captured output

```
NOTIFICATION: item 1/5 (1/5)
[message_handler] (also) saw progress: item 1/5 (1.0/5.0)
NOTIFICATION: item 2/5 (2/5)
[message_handler] (also) saw progress: item 2/5 (2.0/5.0)
NOTIFICATION: item 3/5 (3/5)
[message_handler] (also) saw progress: item 3/5 (3.0/5.0)
NOTIFICATION: item 4/5 (4/5)
[message_handler] (also) saw progress: item 4/5 (4.0/5.0)
NOTIFICATION: item 5/5 (5/5)
[message_handler] (also) saw progress: item 5/5 (5.0/5.0)
FINAL RESULT: Processed 5 items.
```

Five progress notifications, then exactly one final result printed separately -- the MCP
contract the exercise is explicit about not breaking.

## The most important finding: the exercise's own scaffold has a real gap

The scaffold shows only `ClientSession(read, write, message_handler=on_message)` as the way to
receive notifications. I tested that literally, on its own, against a real running server --
**zero notifications arrived**, even though the tool ran to completion and returned its correct
final result. Tracing this through the SDK source (`mcp/server/session.py`):

```python
async def report_progress(self, progress, total=None, message=None) -> None:
    """Report progress for the inbound request this session is scoped to.

    A no-op when the caller did not request progress. ...
    """
```

`ctx.report_progress(...)` -- the server-side call `process_items` makes -- silently does nothing
unless the *incoming request* asked for progress. A request only carries that ask when the
client's `call_tool(...)` is given a `progress_callback`; that's what causes the SDK to attach a
progress token to the outgoing request in the first place (confirmed by reading
`ClientSession.send_request`, where `progress_callback is not None` is exactly the condition
that sets `opts["on_progress"]`).

Verified both directions directly, not assumed from reading the source alone:

- **`message_handler` only, no `progress_callback`:** ran against a real server -- 0 notifications
  delivered, tool still completed and returned "Processed 3 items." correctly.
- **`message_handler` + `progress_callback` together:** ran again -- every progress step arrived
  through *both* channels (`progress_callback` gets clean `(progress, total, message)` arguments;
  `message_handler` also receives the same events as typed `ProgressNotification` objects once
  the token is attached).

`client_stream.py` uses both: `progress_callback` does the actual `NOTIFICATION: ...` display
(it's the mechanism that makes the notifications exist at all), and `message_handler` is
genuinely exercised too -- printing the same events a second time, unprefixed, and acting as the
catch-all for anything else a server might send (transport exceptions, other notification
types) -- rather than being registered and then silently doing nothing, which is what a literal
reading of the scaffold on its own would produce.

## Streamable HTTP needed no workaround

The exercise anticipates possibly needing one ("if your SDK version lacks a direct flag,
document the workaround you chose"). Checked directly rather than assumed: the installed `mcp`
(2.0.0) has a fully-typed overload for exactly this --

```python
def run(self, transport: Literal["streamable-http"], *, host: str = ..., port: int = ...,
        streamable_http_path: str = ..., json_response: bool = ..., stateless_http: bool = ...,
        event_store: EventStore | None = ..., ...) -> None: ...
```

so `server_stream.py` just calls `mcp.run(transport="streamable-http", host="127.0.0.1",
port=8000)` directly. No fallback to STDIO or SSE was needed.

## Same `mcp` version note as the other MCP exercises in this series

`FastMCP` (the name the exercise's scaffold uses) is `MCPServer` in this version, imported from
`mcp.server.mcpserver` -- no backward-compatible alias exists anywhere in the installed package.
`Context` (for `ctx.report_progress`) lives in the same module.

## Part D -- localhost binding and where auth/CORS would go

`server_stream.py` binds to `127.0.0.1` explicitly (matching the default, but written out so
it's visible in the code, not just true by coincidence). The comment at the bottom of that file
says exactly where hardening would go if this were ever exposed beyond localhost:

- **Auth:** `MCPServer.run(...)` accepts a `transport_security` option for exactly this -- not
  configured here, since dev-only localhost traffic doesn't need it.
- **CORS:** would need Starlette's `CORSMiddleware` wrapped around the ASGI app
  `mcp.streamable_http_app()` returns, with an explicit origin allow-list rather than allowing
  every origin -- also not configured here for the same reason.

## Design choices

**`process_items`'s progress step delay is 0.3 seconds** -- long enough to actually see
notifications arrive one at a time in the captured output rather than all at once, short enough
not to slow down a demo or grading run, matching the exercise's own "200-500ms" guidance.

**The tool signature is `async def process_items(total: int = 5, ctx: Context = None) -> str`,
not something that threads progress through the return value.** `ctx.report_progress(...)`
returns `None` and cannot become the tool's return value even by accident -- only the `return`
statement at the very end does that. That's not just a design choice stated in prose; it's the
actual shape of the code enforcing the separation the exercise asks for between "progress" and
"the final result."

## What's stubbed rather than built out

No STDIO fallback path is implemented in `server_stream.py` / `client_stream.py` -- Streamable
HTTP worked directly with no workaround needed, so there was nothing to fall back from. The two
companion MCP exercises in this series (`mcp-101`, `mcp-weather`) already demonstrate the STDIO
path in full if that's what's needed for comparison.
