"""
config.py -- the switches the exercise's Task 1 and Task 3 ask for.
"""

import os

# --- Task 1: MCP_HTTP_TOKEN ---
#
# Read here because the exercise asks for it, but genuinely unused by
# anything in this project: both `notes_server.py` and
# `airbnb_stub_server.py` (and the real Airbnb server) run over STDIO, not
# HTTP -- a spawned subprocess with private pipes has no network-facing
# endpoint for a bearer token to protect in the first place. This setting
# would matter if either server were run over Streamable HTTP instead (see
# the companion "HTTP / Streamable HTTP in MCP" exercise in this series,
# which covers exactly that transport and where an auth token like this
# one would actually get checked). Left in place, honestly labeled as
# currently inert, rather than silently dropped just because it isn't
# wired to anything yet.
MCP_HTTP_TOKEN = os.environ.get("MCP_HTTP_TOKEN", "")

# --- Task 3: real vs stub switches ---
USE_REAL_AIRBNB = os.environ.get("USE_REAL_AIRBNB", "false").lower() == "true"
USE_REAL_LLM = os.environ.get("USE_REAL_LLM", "false").lower() == "true"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

if USE_REAL_LLM and not GITHUB_TOKEN:
    print("[config] USE_REAL_LLM is True but GITHUB_TOKEN is not set -- falling back to the stub planner.")
    USE_REAL_LLM = False

if USE_REAL_LLM:
    # See llm_planner.py's own prominent warning: GitHub Models is fully
    # retired as of July 30, 2026. Setting USE_REAL_LLM=True (with a valid
    # GITHUB_TOKEN) will still route to `real_plan`, which will still fail
    # -- this repeats the warning here too, at the point the switch is
    # actually flipped, rather than only inside the module that eventually
    # raises the error.
    print(
        "[config] USE_REAL_LLM is True. Note: GitHub Models (the provider this project "
        "targets) is fully retired as of July 30, 2026 -- this call will fail regardless "
        "of token validity. See llm_planner.py and README.md."
    )
