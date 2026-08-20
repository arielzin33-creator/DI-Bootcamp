"""
llm_planner.py -- turns a prompt into a list of proposed tool calls across
*both* connected servers (notes + Airbnb), via a rule-based stub (default)
or a real LLM (opt-in, needs GITHUB_TOKEN -- see the warning below).

Same split as the companion "MCP client with an LLM" exercise in this
series: `stub_plan` / `real_plan` / `propose_tool_calls` all return the
same shape, `[{"name": ..., "arguments": {...}}, ...]`, regardless of
which produced it -- what lets `agent.py`'s executor loop stay identical
either way, and route each call to the right server purely by checking
its `name`'s prefix (`notes_` vs `airbnb_`).
"""

import os
import re


def convert_to_llm_tool(tool) -> dict:
    """Convert one MCP `Tool` into an OpenAI-style function-calling spec."""
    return {
        "type": "function",
        "function": {
            "name": tool.name,
            "description": tool.description or "",
            "parameters": tool.input_schema,
        },
    }


# --- Stub planner: no tokens, no network, fully deterministic ---

_SEARCH_PATTERN = re.compile(
    r"(?:find|search for|look for)\s+listings?\s+in\s+([a-zA-Z ]+?)(?:\s+and\b|[.,]|$)", re.IGNORECASE
)
# Stops at the first sentence boundary (a period followed by whitespace, or
# the end of the string) rather than the end of the whole prompt. An
# earlier version anchored the non-greedy `.+?` to `$` directly, which
# defeats non-greedy matching entirely -- reaching `$` is mandatory, so the
# group still expanded to consume everything up to the very end. Caught by
# actually running a compound prompt ("...note that I am planning a trip.
# Then list my notes.") through it: the captured note text included the
# unrelated second sentence verbatim, rather than stopping after the first.
_NOTE_PATTERN = re.compile(
    r"(?:note|remember|save a note)(?:\s+that)?[:\s]+(.+?)(?:\.\s|\.\Z|\Z)", re.IGNORECASE
)


def stub_plan(prompt: str, llm_tools: list[dict]) -> list[dict]:
    """
    A rule-based stand-in for a real LLM's function-calling output.

    Deliberately checks for *both* patterns rather than returning on the
    first match -- a single prompt like "Find listings in Paris and note
    that I searched Paris" is meant to produce two tool_calls, one per
    server, which is the actual point of this exercise: one plan, routed
    across two independently-connected MCP servers.
    """
    available = {spec["function"]["name"] for spec in llm_tools}
    calls = []

    search_match = _SEARCH_PATTERN.search(prompt)
    if search_match and "airbnb_search" in available:
        location = search_match.group(1).strip()
        calls.append({"name": "airbnb_search", "arguments": {"location": location}})

    note_match = _NOTE_PATTERN.search(prompt)
    if note_match and "notes_add" in available:
        text = note_match.group(1).strip()
        calls.append({"name": "notes_add", "arguments": {"text": text}})

    if re.search(r"list (?:my |all )?notes", prompt, re.IGNORECASE) and "notes_list" in available:
        calls.append({"name": "notes_list", "arguments": {}})

    return calls


# --- Real planner: GitHub Models, opt-in via GITHUB_TOKEN ---
#
# *** IMPORTANT, as of writing this (August 2026): GitHub Models is fully
# *** retired, confirmed directly via GitHub's own changelog -- announced
# *** July 1, 2026, brownouts July 16 and 23, fully shut down July 30,
# *** 2026. The exercise's "stub vs real LLM (GitHub Models)" switch no
# *** longer has a working "real" option, regardless of whether
# *** GITHUB_TOKEN is valid. This is the same finding, confirmed the same
# *** way (a real call from this exact code reaching the real endpoint and
# *** getting back a structured retirement error), as the companion
# *** "MCP client with an LLM" exercise in this series -- see that
# *** project's README for the full account, including the captured error.
_GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference"
_GITHUB_MODELS_MODEL = "openai/gpt-4o-mini"


def real_plan(prompt: str, llm_tools: list[dict]) -> list[dict]:
    """Ask a real model (via GitHub Models) to propose tool calls. See the warning above."""
    import json

    from openai import OpenAI  # imported lazily so stub mode never needs this installed

    token = os.environ["GITHUB_TOKEN"]
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
            "retired -- this is very likely why, not a bug in this code. The original "
            f"error was: {error!r}"
        ) from error

    message = response.choices[0].message
    calls = []
    for call in message.tool_calls or []:
        calls.append({"name": call.function.name, "arguments": json.loads(call.function.arguments)})
    return calls


def propose_tool_calls(prompt: str, llm_tools: list[dict]) -> list[dict]:
    """Stub by default; real only if GITHUB_TOKEN is set (and even then, see the warning above)."""
    if os.environ.get("GITHUB_TOKEN"):
        return real_plan(prompt, llm_tools)
    return stub_plan(prompt, llm_tools)
