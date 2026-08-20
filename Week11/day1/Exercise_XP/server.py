"""
server.py — a tiny MCP server exposing one tool and one resource.

Written against `mcp` 2.0.0. The exercise's own scaffold imports
`from mcp.server.fastmcp import FastMCP`, which does not exist in this
version — `FastMCP` was renamed to `MCPServer` with no backward-compatible
alias left behind (confirmed directly: `grep -rl "FastMCP"` across the
installed package returns nothing at all). Everything else about the
scaffold — the `@mcp.tool()` / `@mcp.resource()` decorators, and calling
`mcp.run()` to start the STDIO loop — is unchanged; only the class's name
and where it's imported from are different. See README.md for how this was
confirmed rather than assumed.
"""

from mcp.server import MCPServer

mcp = MCPServer("Demo")


@mcp.tool()
def add(a: int, b: int) -> int:
    """Return the sum of two integers."""
    return a + b


@mcp.resource("greeting://{name}")
def greet(name: str) -> str:
    """Return a greeting for the given name."""
    return f"Hello, {name}!"


if __name__ == "__main__":
    mcp.run()  # transport="stdio" is the default
