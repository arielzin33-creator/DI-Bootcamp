import asyncio

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

server_params = StdioServerParameters(
    command="mcp", args=["run", "server.py"], env=None
)


async def run():
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            resources = await session.list_resources()
            print("Resources:", [r.name for r in resources.resources])

            resource_templates = await session.list_resource_templates()
            print("Resource templates:", [t.name for t in resource_templates.resourceTemplates])

            tools = await session.list_tools()
            print("Tools:", [t.name for t in tools.tools])

            cities = await session.read_resource("cities://list")
            print("cities://list ->", cities.contents[0].text)

            weather = await session.call_tool("get_weather", arguments={"city": "Paris"})
            print("get_weather('Paris') ->", weather.content[0].text)


if __name__ == "__main__":
    asyncio.run(run())
