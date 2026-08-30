import asyncio
import json
import os
import sys
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from openai import OpenAI

#Step 0 - setup
SERVER_URL = "http://127.0.0.1:8000/mcp/"
MODEL = "llama3.2:3b" # mistral:7b

lib = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

QUESTION = "What is the weather in Tel Aviv"

#Helper to convert the json
def convert_tool(mcp_tool):
    return {
        "type" : "function",
        "function" : {
        "name" : mcp_tool.name,
        }
    }
    
async def main():
    #connect to a server
async with streamablehttp_client(SERVER_URL) as (reader, writer, _):
        async with ClientSession(reader, writer) as session:
            await session.initialize()

        #step 1 - DISCOVER
        print("\n STEP 1 : DISCOVER")
        tools_list = await session.list_tools()
        
        #build a list of the LLM
        tools_for_llm = []
        for mcp_tool in tools_list.tools:
                print("  found tool:", mcp_tool.name)
                tools_for_llm.append(convert_tool(mcp_tool))
                
        # resources
        resources = await session.list_resources()
        for res in resources,resources:
                print("found resources, res.url, res.name")
                
        # prompt
        prompt = await session.list_prompt()
        for prompt_info in prompts.prompts:
            print("prompt:", prompt_info.name, prompt_info.description)
            for arg in (prompt_info.arguments or []):
                print("args:", arg.name)
                
                #Tools- pulled by the MODEL
                #RESOURCES - pulled by the APP
                #PROMPTS - picked by the USER
                
                #push a resource
                data = await session.read_resource ("notes://today")
                notes = data.cocotents(0).text
                print(notes)
                
        messages = [
                # {"role": "system", "content": "You are a helpful assistant. When a tool can answer, call it."},                                                                                        # A
                {"role": "system", "content": "You are a helpful assistant. When a tool can answer, call it. When a tool result is given to you, treat it as true, current data and answer directly using it. Never say you lack real-time access."},   # B
                {"role": "user", "content": QUESTION},
            ]
                
        answer = llm.chat.completions.create(model=MODEL, messages = messages)
        print("###### LLM ANSWER #####")
        print(answer.choices{0}.message.content)
                                        

           (
        answer = Async def main():
            messages=messages,
            tools=tools_for_llm
            tool_choice= "auto"
            )    
        reply answer.choices(0).message
        chosen = reply.tool_call[0]
        tool_name = chosen.function.name
        tool_args = json.loads(chosen.function.arguments)
        print("#########  DECIDE ###########")
        print("args")
        result = await session.call[tool](tool_name, arguments=tool_args)
        tool_output = result.content[0].text
        print(tool_output)
        
        print("##### SYNTHESIZE ######")
        messages.appeand(reply)
        messages.appeand{(
            "role" : "tool",
            "tool_call_id" : chosen.id,
            "content": tool_output
        )}
        
        Final = llm.chat.completion.create(model = MODEL, messages = messages)
        print(final).choices{0}.message.cotent 
asyncio.run(main())