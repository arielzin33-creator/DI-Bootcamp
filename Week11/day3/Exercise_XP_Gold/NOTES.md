# Notes on this implementation

## Real bugs found by actually testing this (not just writing it)

1. **`HfApiModel` doesn't exist in current `smolagents`.** Installed
   `smolagents==1.26.0` (far ahead of the `>=0.2.1` pin) has renamed it to
   `InferenceClientModel`. Confirmed by import error, then fixed.

2. **The token isn't read automatically the way the exercise claims.**
   `InferenceClientModel` defaults to reading `HF_TOKEN` from the environment,
   not `HUGGINGFACEHUB_API_TOKEN` (as the original starter.py comment says) or
   `HF_API_TOKEN` (as `.env.example` defines). Confirmed by reading the
   constructor source. Fixed by passing `token=os.getenv("HF_API_TOKEN")`
   explicitly, so the `.env.example` variable name actually works.

3. **`@tool` now requires a full `Args:` docstring section per parameter, or
   it crashes at import time** — before the simulation even starts. The
   exercise's own example docstrings (e.g. `"""Check the recent resource
   distribution history for a specific penguin."""` with no `Args:` block)
   raise `DocstringParsingException` immediately. Confirmed by reproducing the
   crash, then fixed by adding `Args:` sections to every tool
   (`check_history`, `record_distribution`, and the new `find_food`).

4. **The emoji in the log output crash on Windows.** `print(f"🔄 ...")` /
   `find_food`'s `🐟` raise `UnicodeEncodeError` on Windows' default console
   codepage (cp1252) — reproduced directly. Fixed with
   `sys.stdout.reconfigure(encoding="utf-8")` at the top of `starter.py`, so
   it behaves the same on Windows, macOS, Linux, and Colab.

5. **JSON parsing was fragile against real LLM output.** The original
   `str(response).split("final_answer:")[-1]` approach assumes a specific
   text format that doesn't match current `ToolCallingAgent.run()` output,
   and does nothing to handle markdown code fences (```` ```json ... ``` ````)
   or stray text around the JSON — both very common with a 7B open model that
   doesn't strictly follow "JSON only" instructions. Replaced with
   `_parse_json_response()`, which strips code fences, tries direct
   `json.loads`, then falls back to regex-extracting the first `{...}` block.
   Verified against 5 realistic messy-output cases (clean JSON, fenced JSON,
   JSON with commentary around it, an already-parsed dict, and unparseable
   text) — all handled correctly.

## What I verified without needing your HF token

- `starter.py` imports cleanly (no `DocstringParsingException`).
- `find_food("fishing")` returns 2–7, `find_food("foraging")` returns 0–3, over
  40 sampled calls.
- `check_history` / `record_distribution` correctly track and aggregate state
  across calls.
- `_parse_json_response` handles clean JSON, fenced JSON, JSON with
  surrounding text, an already-parsed dict, and unparseable text.
- `ScientistAgent` and `PenguinAgent` construct correctly, with `find_food`
  registered as a tool on `PenguinAgent` (`penguin.tools` includes
  `find_food`).

See `test_offline.py` for the actual test script — run it yourself with
`python test_offline.py` to reproduce.

## What I could NOT verify (needs your real HF token)

The actual multi-round simulation (`python exercises/starter.py`) makes real
calls to the Hugging Face Inference API through `ToolCallingAgent.run()` —
I have no HF account or token, so I could not run this end-to-end. Two things
to watch for once you do, with a real `HF_API_TOKEN` in `.env`:

- **Model availability on the free Inference API changes over time.** Some
  models require a specific "Inference Provider" to be set (via
  `InferenceClientModel(provider=...)`) rather than being served directly.
  If `HuggingFaceH4/zephyr-7b-beta` errors with something like "model not
  supported" or "no provider available," check the model's page on
  huggingface.co for which providers currently serve it, and either pick a
  listed provider or swap `HF_MODEL_ID` to a model confirmed available.
- **A 7B model may not always return the requested JSON shape even with the
  fenced/messy-output handling above** — `_parse_json_response` falls back to
  `{}` when it truly can't parse anything, which `respond_to_action`/
  `take_action` already handle gracefully (zero food/tool given, or a safe
  `request_food` default), so the simulation won't crash, but don't be
  surprised if a turn or two falls back to defaults rather than a real model
  decision.
