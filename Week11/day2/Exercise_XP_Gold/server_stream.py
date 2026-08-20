"""
server_stream.py -- an MCP server exposing one long-running tool
(`process_items`) that reports structured progress while it works, served
over Streamable HTTP.

Written against `mcp` 2.0.0 -- `FastMCP` is `MCPServer` in this version
(see README.md, and the two companion MCP exercises in this series for the
same finding). Streamable HTTP is a fully-typed, first-class option here:
`mcp.run(transport="streamable-http", ...)` has its own typed overload with
`host`/`port`/`streamable_http_path` etc. (confirmed by inspecting the
actual overload signatures in the installed package) -- no workaround was
needed, contrary to what the exercise anticipates might be necessary.
"""

import asyncio

from mcp.server.mcpserver import Context, MCPServer

mcp = MCPServer("Streaming-Demo")

# Deliberately tiny but visible -- long enough to actually see progress
# notifications arrive one at a time rather than all at once, short enough
# not to slow down a demo or grading run.
STEP_DELAY_SECONDS = 0.3


@mcp.tool(description="Process a number of items one at a time, reporting progress as it goes.")
async def process_items(total: int = 5, ctx: Context = None) -> str:
    """
    Pretend to process `total` items, one at a time.

    Progress is reported via `ctx.report_progress(...)` -- a structured MCP
    *notification*, not a print statement and not part of the return value.
    The function still returns exactly one final result at the end, same as
    any other MCP tool; the notifications are a side channel, not a
    replacement for that single result. That distinction is the actual
    point of this exercise, and it's enforced by the SDK's own shape here:
    `report_progress` returns `None` and cannot become the tool's return
    value even by accident -- only the `return` statement at the bottom
    does that.
    """
    for item_number in range(1, total + 1):
        await asyncio.sleep(STEP_DELAY_SECONDS)
        if ctx is not None:
            await ctx.report_progress(
                progress=item_number,
                total=total,
                message=f"item {item_number}/{total}",
            )

    return f"Processed {total} items."


if __name__ == "__main__":
    # host/port default to 127.0.0.1:8000 already -- explicit here so the
    # "bind to localhost for dev" requirement is visible in the code, not
    # just true by coincidence of the default.
    #
    # If this were ever exposed beyond localhost: add a bearer-token (or
    # OAuth) check in front of the Streamable HTTP endpoint -- MCPServer's
    # `run()` accepts a `transport_security` option for exactly this, which
    # isn't configured here since dev-only, localhost-bound traffic doesn't
    # need it. Also add an explicit CORS allow-list (Starlette's
    # `CORSMiddleware`, wrapped around the ASGI app `mcp.streamable_http_app()`
    # returns) rather than allowing every origin -- this app is never wrapped
    # in CORS middleware here for the same localhost-only reason.
    mcp.run(transport="streamable-http", host="127.0.0.1", port=8000)
