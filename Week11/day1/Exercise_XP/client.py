"""
client.py — spawns server.py over STDIO, discovers its tools/resources, and
invokes them.

Written against `mcp` 2.0.0 — see server.py's docstring and README.md for
what changed from the exercise's original scaffold and how it was verified
rather than assumed. The client-side imports the exercise gives
(`ClientSession`, `StdioServerParameters`, `stdio_client`) are unchanged in
this version; it's only the server-side `FastMCP` -> `MCPServer` rename
that broke.
"""

import asyncio

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

server_params = StdioServerParameters(command="mcp", args=["run", "server.py"], env=None)


def extract_content(payload):
    """Best-effort to pull text out of an MCP read_resource / call_tool result."""
    if hasattr(payload, "contents"):
        contents = payload.contents
        if contents:
            first = contents[0]
            if hasattr(first, "text"):
                return first.text
            if isinstance(first, dict) and "text" in first:
                return first["text"]
            return str(first)
    if hasattr(payload, "content"):
        content = payload.content
        if content:
            first = content[0]
            if hasattr(first, "text"):
                return first.text
            if isinstance(first, dict) and "text" in first:
                return first["text"]
        return str(content)
    return str(payload)


async def run():
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # --- List resources and tools ---
            resources_result = await session.list_resources()
            print("Resources:", [r.name for r in resources_result.resources])

            # `greeting://{name}` is a *templated* resource (it has a
            # parameter), not a static one -- the MCP spec keeps those in a
            # separate list from concrete, ready-to-read resources, which
            # is why `list_resources()` alone won't show it. Verified
            # directly while building this: `list_resources()` returned an
            # empty list for this server, and the template only appeared
            # here. Both are printed so the "greeting" resource actually
            # shows up somewhere, the way the exercise's instructions
            # expect it to be visible via discovery.
            templates_result = await session.list_resource_templates()
            print("Resource templates:", [t.name for t in templates_result.resource_templates])

            tools_result = await session.list_tools()
            print("Tools:", [t.name for t in tools_result.tools])

            # --- Read the greeting resource ---
            greeting = await session.read_resource("greeting://hello")
            print("greeting://hello ->", extract_content(greeting))

            # --- Call the add tool ---
            sum_result = await session.call_tool("add", {"a": 1, "b": 7})
            print("add(1, 7) ->", extract_content(sum_result))


if __name__ == "__main__":
    asyncio.run(run())
