"""
client.py -- spawns server.py over STDIO, discovers its capabilities, reads
cities://list, and calls get_weather.

Written against `mcp` 2.0.0 -- see server.py's docstring and README.md.
"""

import asyncio

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

server_params = StdioServerParameters(command="mcp", args=["run", "server.py"], env=None)


def extract_text(payload):
    """Best-effort to pull text out of an MCP read_resource / call_tool result."""
    if hasattr(payload, "contents"):
        contents = payload.contents
        if contents:
            first = contents[0]
            return getattr(first, "text", str(first))
    if hasattr(payload, "content"):
        content = payload.content
        if content:
            first = content[0]
            return getattr(first, "text", str(first))
        return str(content)
    return str(payload)


async def run():
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # --- Discover: resources and tools ---
            resources_result = await session.list_resources()
            print("Resources:", [r.name for r in resources_result.resources])
            # `cities://list` has no parameters -- unlike a templated
            # resource (e.g. `greeting://{name}` from the companion "MCP
            # 101" exercise), a concrete, parameter-free resource like this
            # one *does* show up directly under list_resources(), not only
            # under list_resource_templates(). Verified by running this:
            # "cities" appears in the printed list below.

            tools_result = await session.list_tools()
            print("Tools:", [t.name for t in tools_result.tools])

            # --- Read cities://list ---
            cities = await session.read_resource("cities://list")
            print("cities://list ->")
            print(extract_text(cities))

            # --- Call get_weather for a valid city ---
            weather = await session.call_tool("get_weather", {"city": "Paris"})
            print("get_weather('Paris') ->", extract_text(weather))

            # --- Call get_weather for an unsupported city, to show the error path too ---
            missing = await session.call_tool("get_weather", {"city": "Atlantis"})
            print("get_weather('Atlantis') ->", extract_text(missing))


if __name__ == "__main__":
    asyncio.run(run())
