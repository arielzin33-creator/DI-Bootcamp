"""
client.py -- Exercises 2 through 5 of the "MCP client with an LLM" set,
run against server.py.

Exercise 2 (connect & initialize), Exercise 3 (discover), Exercise 4
(convert MCP tools -> LLM function specs), and Exercise 5 (plan & execute)
are marked below as they happen, in the order they run.
"""

import asyncio

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from llm_planner import convert_to_llm_tool, propose_tool_calls

server_params = StdioServerParameters(command="mcp", args=["run", "server.py"], env=None)

DEMO_PROMPT = "Add 2 to 20."


def extract_text(payload):
    """Best-effort to pull text out of an MCP read_resource / call_tool result."""
    if hasattr(payload, "contents"):
        contents = payload.contents
        if contents:
            return getattr(contents[0], "text", str(contents[0]))
    if hasattr(payload, "content"):
        content = payload.content
        if content:
            return getattr(content[0], "text", str(content[0]))
        return str(content)
    return str(payload)


async def run():
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # --- Exercise 2: connect & initialize ---
            await session.initialize()
            print("[Exercise 2] Session initialized.")

            # --- Exercise 3: discover ---
            resources_result = await session.list_resources()
            print("[Exercise 3] Resources:", [r.name for r in resources_result.resources])

            tools_result = await session.list_tools()
            print("[Exercise 3] Tools:")
            for tool in tools_result.tools:
                properties = tool.input_schema.get("properties", {})
                print(f"  - {tool.name}: inputSchema properties = {list(properties.keys())}")
                for prop_name, prop_schema in properties.items():
                    print(f"      {prop_name}: {prop_schema.get('type')}")

            # --- Exercise 4: convert MCP tools to LLM function specs ---
            llm_tools = [convert_to_llm_tool(tool) for tool in tools_result.tools]
            print("[Exercise 4] Converted LLM tool specs:")
            for spec in llm_tools:
                print(" ", spec)

            # --- Exercise 5: plan & execute ---
            print(f"[Exercise 5] Prompt: {DEMO_PROMPT!r}")
            tool_calls = propose_tool_calls(DEMO_PROMPT, llm_tools)
            print("[Exercise 5] Proposed tool_calls:", tool_calls)

            if not tool_calls:
                print("[Exercise 5] No tool call was proposed for this prompt.")
                return

            for call in tool_calls:
                result = await session.call_tool(call["name"], call["arguments"])
                print(f"[Exercise 5] {call['name']}({call['arguments']}) -> {extract_text(result)}")


if __name__ == "__main__":
    asyncio.run(run())
