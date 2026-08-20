"""
server.py -- a minimal MCP weather server: one tool, one resource, no LLM
calls anywhere.

Written against `mcp` 2.0.0. As in the previous MCP exercise in this
series, the exercise's own text says `FastMCP("WeatherDemo")` -- in this
installed version, `FastMCP` was renamed to `MCPServer` with no
backward-compatible alias (confirmed by grepping the installed package for
"FastMCP": nothing). Everything else -- `@mcp.tool()`, `@mcp.resource(...)`,
and `mcp.run()` to start the STDIO loop -- is unchanged. See README.md for
how this was checked rather than assumed, and for the actual captured
output.
"""

import logging
import sys

from mcp.server import MCPServer

# Logging to stderr specifically, not stdout -- stdout is the STDIO
# transport's actual message channel between client and server. Anything
# printed to stdout that isn't a valid protocol message would corrupt the
# stream the client is trying to parse. `logging.basicConfig`'s default
# stream is already stderr, but it's set explicitly here so that stays
# true regardless of what any other library configures later.
logging.basicConfig(level=logging.INFO, stream=sys.stderr, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("weather-server")

mcp = MCPServer("WeatherDemo")

# A small in-memory lookup -- deliberately not a live weather API. The
# point of this exercise is watching MCP's request/response flow itself,
# not weather data; a real API call would add a second thing (network
# reliability) that has nothing to do with what's being practiced here.
WEATHER_DATA = {
    "paris": {"city": "Paris", "temp_c": 21, "condition": "sunny"},
    "london": {"city": "London", "temp_c": 16, "condition": "cloudy"},
    "nyc": {"city": "NYC", "temp_c": 24, "condition": "clear"},
}


@mcp.tool()
def get_weather(city: str) -> dict:
    """Return static weather data for a supported city."""
    logger.info("get_weather called with city=%r", city)

    key = city.strip().lower()
    if key not in WEATHER_DATA:
        supported = sorted(entry["city"] for entry in WEATHER_DATA.values())
        logger.info("get_weather: %r not found (supported: %s)", city, supported)
        return {"error": f"No weather data for '{city}'.", "supported_cities": supported}

    return WEATHER_DATA[key]


@mcp.resource("cities://list")
def list_cities() -> str:
    """Return the supported cities, one per line."""
    logger.info("cities://list read")
    return "\n".join(sorted(entry["city"] for entry in WEATHER_DATA.values()))


if __name__ == "__main__":
    logger.info("Starting WeatherDemo MCP server over stdio...")
    mcp.run()  # transport="stdio" is the default
