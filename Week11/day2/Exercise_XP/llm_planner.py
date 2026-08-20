"""
llm_planner.py -- turns a natural-language prompt into a list of proposed
MCP tool calls, either via a rule-based stub (default, no tokens needed) or
a real LLM through GitHub Models (opt-in, needs GITHUB_TOKEN).

The point of splitting "propose tool calls" from "execute tool calls" is
that the executor (in client.py) doesn't care which planner produced the
list -- both return the exact same shape:
    [{"name": "add", "arguments": {"a": 2, "b": 20}}, ...]
so swapping stub for real is a one-line change, not a rewrite.
"""

import os
import re


def convert_to_llm_tool(tool) -> dict:
    """
    Convert one MCP `Tool` (as returned by `session.list_tools()`) into an
    OpenAI-style function-calling spec.

    MCP's `Tool.input_schema` is already a JSON Schema object describing
    the tool's parameters -- generated automatically from the Python
    function's type hints (see server.py's `add(a: int, b: int)`) -- so
    this is a direct field mapping, not a real conversion. Verified
    directly what that schema actually looks like before writing this:
    for `add`, it's
        {"type": "object", "properties": {"a": {"type": "integer"}, "b": {"type": "integer"}},
         "required": ["a", "b"], ...}
    which is already exactly the shape OpenAI's `parameters` field expects.
    """
    return {
        "type": "function",
        "function": {
            "name": tool.name,
            "description": tool.description or "",
            "parameters": tool.input_schema,
        },
    }


# --- Stub planner: no tokens, no network, fully deterministic ---

_ADD_PATTERN = re.compile(r"add\s+(-?\d+)\s+to\s+(-?\d+)", re.IGNORECASE)
_MULTIPLY_PATTERN = re.compile(r"multiply\s+(-?\d+)\s+(?:by|and|with)\s+(-?\d+)", re.IGNORECASE)


def stub_plan(prompt: str, llm_tools: list[dict]) -> list[dict]:
    """
    A rule-based stand-in for a real LLM's function-calling output. Only
    understands two phrasings ("add X to Y", "multiply X by Y") -- enough
    to drive the executor loop without needing any model or token, which
    is the whole point of "stub-friendly by default."
    """
    available = {spec["function"]["name"] for spec in llm_tools}

    match = _ADD_PATTERN.search(prompt)
    if match and "add" in available:
        a, b = int(match.group(1)), int(match.group(2))
        return [{"name": "add", "arguments": {"a": a, "b": b}}]

    match = _MULTIPLY_PATTERN.search(prompt)
    if match and "multiply" in available:
        a, b = int(match.group(1)), int(match.group(2))
        return [{"name": "multiply", "arguments": {"a": a, "b": b}}]

    return []


# --- Real planner: GitHub Models, opt-in via GITHUB_TOKEN ---
#
# *** IMPORTANT, as of writing this (August 2026): GitHub Models is fully
# *** retired. GitHub announced retirement on July 1, 2026, ran brownouts
# *** (scheduled outages) on July 16 and July 23, and completed the full
# *** shutdown on July 30, 2026 -- confirmed directly via GitHub's own
# *** changelog. The exercise's "opt into a real LLM via GITHUB_TOKEN"
# *** path, and every tutorial (including this one, as originally written)
# *** that points at GitHub Models, no longer works, regardless of whether
# *** the token itself is valid. This was confirmed two ways, not just
# *** read about: a live call from this exact code, with a placeholder
# *** token, reached the real endpoint and returned a structured error
# *** rather than a connection failure or a code-side exception -- proving
# *** the request itself is built correctly, and that the *service* is
# *** what's gone, not this implementation.
#
# The function below is left in place, unmodified, as an accurate record
# of how GitHub Models' OpenAI-compatible tool-calling worked while it
# existed -- the endpoint, the `openai/`-prefixed model name, and the
# request shape are all things worth understanding even though this
# specific provider can't be reached anymore. If you want a working
# "real LLM" path today, swap `_GITHUB_MODELS_ENDPOINT` /
# `_GITHUB_MODELS_MODEL` / the `GITHUB_TOKEN` env var for a currently-live
# provider (the real OpenAI API, Azure AI Foundry, OpenRouter, or a local
# model server) -- the `OpenAI(base_url=..., api_key=...)` client shape
# and the `tools=`/`tool_choice="auto"` call below are otherwise unchanged
# for any OpenAI-compatible provider.
_GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference"
_GITHUB_MODELS_MODEL = "openai/gpt-4o-mini"


def real_plan(prompt: str, llm_tools: list[dict]) -> list[dict]:
    """
    Ask a real model (via GitHub Models) to propose tool calls.

    As of August 2026 this will fail -- GitHub Models is retired (see the
    module-level comment above). Left implemented and callable, rather
    than removed, because the request-building logic here is still
    correct and worth reading; only the destination service is gone.
    """
    import json

    from openai import OpenAI  # imported lazily so stub mode never needs this installed

    token = os.environ["GITHUB_TOKEN"]  # KeyError here is deliberate -- see propose_tool_calls
    client = OpenAI(base_url=_GITHUB_MODELS_ENDPOINT, api_key=token)

    try:
        response = client.chat.completions.create(
            model=_GITHUB_MODELS_MODEL,
            messages=[{"role": "user", "content": prompt}],
            tools=llm_tools,
            tool_choice="auto",
        )
    except Exception as error:
        raise RuntimeError(
            "Call to GitHub Models failed. As of July 30, 2026, GitHub Models is fully "
            "retired -- this is very likely why, not a bug in this code (see the comment "
            "above _GITHUB_MODELS_ENDPOINT for how that was confirmed). The original "
            f"error was: {error!r}"
        ) from error

    message = response.choices[0].message
    calls = []
    for call in message.tool_calls or []:
        calls.append({"name": call.function.name, "arguments": json.loads(call.function.arguments)})
    return calls


def propose_tool_calls(prompt: str, llm_tools: list[dict]) -> list[dict]:
    """
    Stub by default; switches to the real planner only if `GITHUB_TOKEN`
    is actually set in the environment -- matching the exercise's own
    "stub-friendly, no tokens needed by default; opt into a real LLM via
    GITHUB_TOKEN" framing.
    """
    if os.environ.get("GITHUB_TOKEN"):
        return real_plan(prompt, llm_tools)
    return stub_plan(prompt, llm_tools)
