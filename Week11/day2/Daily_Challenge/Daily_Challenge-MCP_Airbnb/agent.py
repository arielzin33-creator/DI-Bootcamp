"""
agent.py -- the mini-agent: connects to the notes server and an Airbnb
server (stub by default, real if configured), discovers tools from both,
gets a plan, and routes each proposed call to whichever server actually
owns that tool.
"""

import asyncio

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

import config
from llm_planner import convert_to_llm_tool, propose_tool_calls

NOTES_SERVER_PARAMS = StdioServerParameters(command="mcp", args=["run", "notes_server.py"], env=None)

if config.USE_REAL_AIRBNB:
    # See README.md: the real server currently fails to complete the MCP
    # handshake in this environment (consistent with a protocol-version
    # mismatch -- the package depends on the much older
    # `@modelcontextprotocol/sdk ^1.0.1`). Left wired up as the exercise
    # asks, rather than silently ignored, so the config switch does what
    # it says even though the outcome today is a clear, documented error
    # rather than real listings.
    AIRBNB_SERVER_PARAMS = StdioServerParameters(
        command="npx", args=["-y", "@openbnb/mcp-server-airbnb"], env=None
    )
else:
    AIRBNB_SERVER_PARAMS = StdioServerParameters(command="mcp", args=["run", "airbnb_stub_server.py"], env=None)

DEMO_PROMPT = "Find listings in Paris and note that I searched Paris."


def extract_result(result):
    """
    Pull the actual returned value out of an MCP `CallToolResult`.

    The first version of this read only `result.content[0].text`, assuming
    a tool that returns a list would serialize as one JSON blob in a single
    content block. Running it against `airbnb_search` (which returns
    `list[dict]`) showed that assumption was wrong: MCP emits one text
    block *per list item* -- `airbnb_search` for Paris produced
    `len(result.content) == 2`, and reading only `content[0]` silently
    dropped the second listing without any error, just quietly wrong
    output. `result.structured_content` is the fix: it holds the actual
    parsed return value (list, dict, or scalar) directly, already unwrapped
    correctly regardless of how many content blocks the text
    representation happened to split into. A bare list return, like
    `airbnb_search`'s, arrives wrapped as `{"result": [...]}`; this
    unwraps that one specific shape and falls back to the raw structure
    for anything else (a dict return, like `airbnb_listing_details`,
    arrives unwrapped already).
    """
    structured = result.structured_content
    if isinstance(structured, dict) and set(structured.keys()) == {"result"}:
        return structured["result"]
    if structured is not None:
        return structured

    # Fallback for a tool with no structured_content at all -- join every
    # text block rather than reading only the first, so this can't repeat
    # the same silent-truncation bug for content that isn't structured.
    texts = [getattr(block, "text", str(block)) for block in result.content]
    return "\n".join(texts) if texts else None


async def run():
    async with stdio_client(NOTES_SERVER_PARAMS) as (notes_read, notes_write):
        async with ClientSession(notes_read, notes_write) as notes_session:
            await notes_session.initialize()

            async with stdio_client(AIRBNB_SERVER_PARAMS) as (airbnb_read, airbnb_write):
                async with ClientSession(airbnb_read, airbnb_write) as airbnb_session:
                    await airbnb_session.initialize()

                    # --- Discover tools from both servers ---
                    notes_tools = (await notes_session.list_tools()).tools
                    airbnb_tools = (await airbnb_session.list_tools()).tools
                    print("Notes tools:", [t.name for t in notes_tools])
                    print("Airbnb tools:", [t.name for t in airbnb_tools])

                    # --- Convert both sets to one combined LLM function-spec list ---
                    llm_tools = [convert_to_llm_tool(t) for t in notes_tools] + [
                        convert_to_llm_tool(t) for t in airbnb_tools
                    ]

                    # --- Plan ---
                    print(f"\nPrompt: {DEMO_PROMPT!r}")
                    tool_calls = propose_tool_calls(DEMO_PROMPT, llm_tools)
                    print("Proposed tool_calls:", tool_calls)

                    # --- Execute, routing each call by its name's prefix ---
                    for call in tool_calls:
                        name, arguments = call["name"], call["arguments"]
                        if name.startswith("notes_"):
                            result = await notes_session.call_tool(name, arguments)
                        elif name.startswith("airbnb_"):
                            result = await airbnb_session.call_tool(name, arguments)
                        else:
                            print(f"  (no server owns a tool named {name!r}, skipping)")
                            continue

                        print(f"\n{name}({arguments}) ->")
                        print(" ", extract_result(result))


if __name__ == "__main__":
    asyncio.run(run())
