"""
prove_it_runs.py — Day 1: proof the server is alive (NO LLM needed).

WHY THIS FILE EXISTS
    An MCP server does nothing visible on its own — it starts and WAITS for a
    client. This tiny script IS a client: it connects, lists the tools, and
    calls each one. If you see real output, the server works.

BEFORE YOU RUN
    pip install "mcp[cli]" requests          (once)
    A file named notes.txt must sit next to the server. If missing:
        echo "Hello from Day 1" > notes.txt

HOW TO RUN — two terminal windows, side by side:
    Terminal 1:  python day1_server_full.py      <- leave it RUNNING (foreground!)
    Terminal 2:  python prove_it_runs.py

    #1 GOTCHA: run the server in a REAL foreground terminal. If you background
    it (python day1_server_full.py &) or pipe it, sys.stdin.isatty() is False,
    so the server starts in STDIO mode with NO web server — and this probe
    can't connect. Foreground = HTTP mode = what you want.

WHAT YOU SHOULD SEE
    Connected. The server offers 2 tool(s):
       - read_file: ...
       - get_weather: ...
    Calling read_file("notes.txt") ...   -> <the file's contents>
    Calling get_weather("Tel Aviv") ...  -> Tel Aviv: +28C

TEACHING MOVE
    Watch Terminal 1 while this runs — the waiting server logs the incoming
    request. That cause-and-effect across two windows is where "client and
    server" clicks for students.

TROUBLESHOOTING
    "All connection attempts failed" / "connection refused"
        -> the server isn't running, OR it's in STDIO mode (see GOTCHA above).
    "File not found: notes.txt"
        -> create notes.txt next to the server (see BEFORE YOU RUN).
"""

import asyncio
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

URL = "http://127.0.0.1:8000/mcp/"


async def main():
    print("Connecting to the server at", URL, "...\n")
    async with streamablehttp_client(URL) as (r, w, _):
        async with ClientSession(r, w) as session:
            await session.initialize()

            # 1) DISCOVER — what can this server do?
            tools = (await session.list_tools()).tools
            print(f"Connected. The server offers {len(tools)} tool(s):")
            for t in tools:
                print(f"   - {t.name}: {t.description}")
            print()

            # 2) CALL read_file — proves it can reach YOUR disk
            print('Calling read_file("notes.txt") ...')
            res = await session.call_tool("read_file", {"filename": "notes.txt"})
            print("   ->", "".join(getattr(c, "text", str(c)) for c in res.content), "\n")

            # 3) CALL get_weather — proves it can reach the LIVE web
            print('Calling get_weather("Tel Aviv") ...')
            res = await session.call_tool("get_weather", {"city": "Tel Aviv"})
            print("   ->", "".join(getattr(c, "text", str(c)) for c in res.content), "\n")

            print("If you saw file contents and a temperature above, the server works.")


if __name__ == "__main__":
    asyncio.run(main())
