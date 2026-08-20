"""
server_with_multiply.py -- the optional exercise: same server as server.py,
plus a `multiply(a, b)` tool.

Kept as its own file rather than editing server.py in place, since the
exercise frames this as an explicit, separate "optional" step that rebuilds
the tool list and reruns the planner/executor -- keeping the two servers
side by side makes that before/after comparison possible to see directly,
rather than losing the "before" version once the "after" is written.
"""

from mcp.server import MCPServer

mcp = MCPServer("LLMToolDemo")


@mcp.tool()
def add(a: int, b: int) -> int:
    """Return the sum of two integers."""
    return a + b


@mcp.tool()
def multiply(a: int, b: int) -> int:
    """Return the product of two integers."""
    return a * b


@mcp.resource("info://about")
def about() -> str:
    """A one-line description of this server, readable as a resource."""
    return "LLMToolDemo (+multiply): adds a 'multiply' tool alongside 'add'."


if __name__ == "__main__":
    mcp.run()
