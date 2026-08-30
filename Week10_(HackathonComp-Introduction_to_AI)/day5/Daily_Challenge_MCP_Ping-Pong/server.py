import logging
import sys

from mcp.server.fastmcp import FastMCP

logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger("weather-server")

mcp = FastMCP("WeatherDemo")

WEATHER_DB = {
    "Paris": {"temp_c": 21, "condition": "sunny"},
    "London": {"temp_c": 15, "condition": "cloudy"},
    "NYC": {"temp_c": 24, "condition": "partly cloudy"},
}


@mcp.tool()
def get_weather(city: str) -> dict:
    """Return static weather data for a supported city."""
    logger.info("get_weather called with city=%r", city)
    data = WEATHER_DB.get(city)
    if data is None:
        return {"error": f"No weather data for '{city}'. Supported cities: {', '.join(WEATHER_DB)}"}
    return {"city": city, "temp_c": data["temp_c"], "condition": data["condition"]}


@mcp.resource("cities://list")
def list_cities() -> str:
    """Return the supported cities as a newline-separated list."""
    return "\n".join(WEATHER_DB.keys())


if __name__ == "__main__":
    mcp.run()
