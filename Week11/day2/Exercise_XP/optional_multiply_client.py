"""
optional_multiply_client.py -- the optional exercise: connects to
server_with_multiply.py, rebuilds the LLM function list (now including
`multiply`), and reruns the planner/executor for a multiply prompt.

Structurally identical to client.py -- same discover -> convert -> plan ->
execute steps -- which is itself the point: nothing about the client had
to change to support a new tool. `llm_planner.py`'s `stub_plan` needed one
new pattern added for "multiply X by Y" (see that file), but the executor
loop below is untouched.
"""

import asyncio

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from llm_planner import convert_to_llm_tool, propose_tool_calls

server_params = StdioServerParameters(command="mcp", args=["run", "server_with_multiply.py"], env=None)

DEMO_PROMPT = "Multiply 6 by 7."


def extract_text(payload):
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
            await session.initialize()
            print("Session initialized (server_with_multiply.py).")

            tools_result = await session.list_tools()
            print("Tools (rebuilt list):", [t.name for t in tools_result.tools])

            llm_tools = [convert_to_llm_tool(tool) for tool in tools_result.tools]
            print("Converted LLM tool specs:", [spec["function"]["name"] for spec in llm_tools])

            print(f"Prompt: {DEMO_PROMPT!r}")
            tool_calls = propose_tool_calls(DEMO_PROMPT, llm_tools)
            print("Proposed tool_calls:", tool_calls)

            for call in tool_calls:
                result = await session.call_tool(call["name"], call["arguments"])
                print(f"{call['name']}({call['arguments']}) -> {extract_text(result)}")

            # Confirm the original `add` prompt still works against the
            # rebuilt tool list too -- adding multiply didn't break add.
            add_prompt = "Add 2 to 20."
            print(f"Prompt: {add_prompt!r}")
            add_calls = propose_tool_calls(add_prompt, llm_tools)
            for call in add_calls:
                result = await session.call_tool(call["name"], call["arguments"])
                print(f"{call['name']}({call['arguments']}) -> {extract_text(result)}")


if __name__ == "__main__":
    asyncio.run(run())
