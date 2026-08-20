"""
server.py -- minimal MCP server for the "MCP client with an LLM" exercise
set: one tool (`add`), one resource, STDIO transport.

Written against `mcp` 2.0.0 -- see README.md for why `FastMCP` (as named in
the exercise text) is imported here as `MCPServer` instead, verified
directly rather than assumed, and consistent with the two companion MCP
exercises in this series.
"""

from mcp.server import MCPServer

mcp = MCPServer("LLMToolDemo")


@mcp.tool()
def add(a: int, b: int) -> int:
    """Return the sum of two integers."""
    return a + b


@mcp.resource("info://about")
def about() -> str:
    """A one-line description of this server, readable as a resource."""
    return "LLMToolDemo: a minimal MCP server exposing an 'add' tool, for practicing LLM tool-calling."


if __name__ == "__main__":
    mcp.run()  # transport="stdio" is the default
