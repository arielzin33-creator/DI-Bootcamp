import asyncio
import json
import os
import sys

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from openai import OpenAI

# Step 0 - setup
SERVER_URL = "http://127.0.0.1:8000/mcp/"
MODEL = "qwen3:0.6b"  # mistral:7b

llm = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

QUESTION = "What is the current weather in New York?"

# helper to conver the json
def convert_tool(mcp_tool):
    return {
        "type": "function",
        "function": {
            "name": mcp_tool.name,
            "description": mcp_tool.description,
            "parameters": mcp_tool.inputSchema,
        },
    }

async def main():
    #  connect to server
    async with streamablehttp_client(SERVER_URL) as (reader, writer, _):
        async with ClientSession(reader, writer) as session:
            await session.initialize()

            # step 1 - DISCOVER
            print("\n STEP 1 : DISCOVER")
            tools_list = await session.list_tools()

            #  build a list for the LLM
            tools_for_llm = []
            for mcp_tool in tools_list.tools:
                print("tool:", mcp_tool.name)
                tools_for_llm.append(convert_tool(mcp_tool))

            # resources
            resources = await session.list_resources()
            for res in resources.resources:
                print("resource:", res.uri, res.name)

            #  prompts
            prompts = await session.list_prompts()
            for prompt_info in prompts.prompts:
                print("prompt:", prompt_info.name, prompt_info.description)
                for arg in (prompt_info.arguments or []):
                    print("args:", arg.name)

            # TOOLS - pulled by the MODEL
            # RESOURCES = pushed by the APP
            # PROMPTS = picked by the USER

            # push a resource
            data = await session.read_resource("notes://today")
            notes = data.contents[0].text
            print(notes)

            # messages = [
            #     {"role":"system", "content": "Here are today's notes:\n" + notes},
            #     {"role": "user", "content": "Base on the notes, what should i focus on?"}
            # ]

            # answer = llm.chat.completions.create(model=MODEL, messages=messages)
            # print("######## LLM ANSWER ########")
            # print(answer.choices[0].message.content)

            print("########## DECIDE #############")
            print("Question:", QUESTION)

            messages = [
                {"role": "system", "content": "You are a helpful assistant. When a tool can answer, call it."},                                                                                        # A
                # {"role": "system", "content": "You are a helpful assistant. When a tool can answer, call it. When a tool result is given to you, treat it as true, current data and answer directly using it. Never say you lack real-time access."},   # B
                {"role": "user", "content": QUESTION},
            ]

            answer = llm.chat.completions.create(
                model=MODEL,
                messages=messages,
                tools=tools_for_llm,
                tool_choice= "auto"
            )

            reply = answer.choices[0].message
            chosen = reply.tool_calls[0]
            tool_name = chosen.function.name
            tool_args = json.loads(chosen.function.arguments)

            print(tool_name)
            print(tool_args)

            result = await session.call_tool(tool_name, arguments=tool_args)
            tool_output = result.content[0].text
            print(tool_output)

            print("###### SYNTHESIZE ###########")
            messages.append(reply)
            messages.append({
                "role": "tool",
                "tool_call_id": chosen.id,
                "content": tool_output,
            })

            final = llm.chat.completions.create(model=MODEL, messages=messages)
            print(final.choices[0].message.content)

asyncio.run(main())