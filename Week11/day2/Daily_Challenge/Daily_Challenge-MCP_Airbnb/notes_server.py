"""
notes_server.py -- a tiny local MCP server: two tools for a simple
in-memory notes list, prefixed `notes_` to match how `airbnb_search` /
`airbnb_listing_details` are naturally prefixed on the Airbnb server --
that shared naming convention is what lets `agent.py` route a planned
tool_call to the right server by checking its name's prefix, without
needing to track which server owns which tool separately.

Written against `mcp` 2.0.0 -- `FastMCP` is `MCPServer` in this version;
see README.md and the other MCP exercises in this series for the same
finding, confirmed the same way each time (checking the installed package
directly rather than assuming the name carried over).
"""

from mcp.server.mcpserver import MCPServer

mcp = MCPServer("Notes")

# In-memory only -- resets every time the server restarts. A real version
# of this would persist to a file or database; that's out of scope here,
# the same boundary drawn in the earlier exercises in this series that
# used an in-memory store as a stand-in for real storage.
_notes: list[str] = []


@mcp.tool(description="Save a short text note.")
def notes_add(text: str) -> str:
    """Append `text` to the notes list and confirm what was saved."""
    _notes.append(text)
    return f"Saved note #{len(_notes)}: {text}"


@mcp.tool(description="List every saved note.")
def notes_list() -> list[str]:
    """Return every note saved so far, in the order they were added."""
    return list(_notes)


if __name__ == "__main__":
    mcp.run()  # transport="stdio" is the default
