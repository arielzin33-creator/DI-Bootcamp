"""
airbnb_stub_server.py -- a stand-in for the real `@openbnb/mcp-server-airbnb`
(run via `npx @openbnb/mcp-server-airbnb`), returning small, fixed listings
instead of actually querying Airbnb.

Tool names and required arguments deliberately mirror the real server
exactly -- `airbnb_search(location, ...)` and
`airbnb_listing_details(id, ...)` -- confirmed against the real package's
own published documentation (github.com/openbnb-org/mcp-server-airbnb),
not guessed. That's what makes `USE_REAL_AIRBNB=True` in `agent.py` a
genuine drop-in swap: the same tool names, the same required argument, so
neither the LLM planner's output nor the prefix-based routing logic needs
to change depending on which Airbnb server is actually running.

See README.md for why the real server currently can't complete the MCP
handshake in this environment.
"""

from mcp.server.mcpserver import MCPServer

mcp = MCPServer("AirbnbStub")

_FIXED_LISTINGS = {
    "paris": [
        {"id": "1001", "name": "Cozy studio near the Louvre", "price": "$95/night", "location": "Paris, France"},
        {"id": "1002", "name": "Montmartre 1BR with a view", "price": "$120/night", "location": "Paris, France"},
    ],
    "lisbon": [
        {"id": "2001", "name": "Sunny loft in Alfama", "price": "$70/night", "location": "Lisbon, Portugal"},
        {"id": "2002", "name": "Modern flat near Belém", "price": "$85/night", "location": "Lisbon, Portugal"},
    ],
}

_DEFAULT_LISTINGS = [
    {"id": "9001", "name": "Generic city-center apartment", "price": "$100/night", "location": "Unknown"},
]

_LISTING_DETAILS = {
    "1001": {
        "id": "1001",
        "name": "Cozy studio near the Louvre",
        "price": "$95/night",
        "location": "Paris, France",
        "amenities": ["WiFi", "Kitchen", "Washer"],
        "host": "Claire",
    },
}


@mcp.tool(description="Search for Airbnb listings by location.")
def airbnb_search(location: str) -> list[dict]:
    """
    A fixed stand-in for the real server's location-based search.

    Only `location` is implemented here (the real server also accepts
    `checkin`, `checkout`, `adults`, `minPrice`, `maxPrice`, and others) --
    enough to exercise the same tool name and required argument the real
    server uses, not a full re-implementation of its filtering.
    """
    key = location.strip().lower()
    for city, listings in _FIXED_LISTINGS.items():
        if city in key:
            return listings
    return _DEFAULT_LISTINGS


@mcp.tool(description="Get detailed information about a specific Airbnb listing.")
def airbnb_listing_details(id: str) -> dict:
    """A fixed stand-in for the real server's per-listing detail lookup."""
    return _LISTING_DETAILS.get(id, {"id": id, "error": "No stub details available for this id."})


if __name__ == "__main__":
    mcp.run()  # transport="stdio" is the default
