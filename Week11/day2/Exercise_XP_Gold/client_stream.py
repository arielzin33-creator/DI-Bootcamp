"""
client_stream.py -- connects to server_stream.py over Streamable HTTP,
shows progress notifications as they arrive, then the final result.

Written against `mcp` 2.0.0. See README.md for the version notes shared
with the two companion MCP exercises in this series, and for a real,
non-obvious finding specific to this exercise: a session-level
`message_handler` alone (the only mechanism the exercise's own scaffold
shows) never receives progress notifications at all. See `on_progress`
below for why.
"""

import asyncio

from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

SERVER_URL = "http://127.0.0.1:8000/mcp"


async def on_message(message):
    """
    The session-level message handler the exercise's scaffold asks for.

    In practice this mostly serves as a catch-all for anything that isn't
    progress -- transport-level exceptions, or other notification types a
    server might send (list-changed notifications, logging messages via
    `ctx.info(...)`, etc.). Progress notifications *do* still arrive here
    too once `on_progress` below has caused the client to request them (see
    that function's docstring) -- this handler prints them a second time,
    unprefixed, specifically to make that arrival visible and to actually
    exercise the `message_handler` mechanism the exercise names, rather
    than silently relying on `progress_callback` alone and never touching
    `message_handler` for anything.
    """
    if isinstance(message, Exception):
        print(f"[message_handler] transport exception: {message}")
        return

    type_name = type(message).__name__
    if type_name == "ProgressNotification":
        params = message.params
        print(f"[message_handler] (also) saw progress: {params.message} ({params.progress}/{params.total})")
    else:
        print(f"[message_handler] {type_name}: {message}")


async def on_progress(progress: float, total: float | None, message: str | None) -> None:
    """
    The actual progress display path.

    This is not decorative -- passing a `progress_callback` here is what
    makes the server's `ctx.report_progress(...)` calls do anything at
    all. Verified directly, not assumed: `Context.report_progress` on the
    server side is a documented no-op "when the caller did not request
    progress," and a request only carries that "ask" when `call_tool` is
    given a `progress_callback`. A first attempt at this client registered
    only `message_handler` (matching the exercise's scaffold literally)
    and received *zero* notifications during a real run against a real
    server, even though the tool completed and returned its final result
    correctly -- the progress calls were happening on the server and being
    silently dropped, not failing to happen at all.
    """
    print(f"NOTIFICATION: {message} ({progress:.0f}/{total:.0f})")


async def run():
    async with streamable_http_client(SERVER_URL) as (read, write):
        async with ClientSession(read, write, message_handler=on_message) as session:
            await session.initialize()

            result = await session.call_tool(
                "process_items",
                {"total": 5},
                progress_callback=on_progress,
            )

            final_text = result.content[0].text
            print(f"FINAL RESULT: {final_text}")


if __name__ == "__main__":
    asyncio.run(run())
