# client.py
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

server_params = StdioServerParameters(
     command="mcp", args=["run", "server.py"], env=None
)

async def run():
     async with stdio_client(server_params) as (read, write):
         async with ClientSession(read, write) as session:
             await session.initialize()
#             # TODO: list resources
#             # TODO: list tools
#             # TODO: read greeting://hello
#             # TODO: call add with a=1, b=7

if __name__ == "__main__":
     import asyncio
     asyncio.run(run())