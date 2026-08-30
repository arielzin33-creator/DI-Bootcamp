# server.py
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("Demo")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Return the sume of a & b."""
    return a + b

@mcp.resource("greeting://{name}")
def greet(name: str) -> str:
    """return greeting string"""
    return f"greetings: {name}!"

if __name__ == "__main__":
    mcp.run(transport="stdio")