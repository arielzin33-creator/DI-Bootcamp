# Notes on this implementation

## The good news: this whole demo actually runs, no HF token needed

Unlike the penguin-agents exercise, `Orchestrator.handle_request` here is
implemented as deterministic Python + direct tool calls (matching the
assignment's own hint: "Prefer deterministic Python for parsing
dates/times/quantities; use the model to craft nice responses"). None of the
provided demo requests need a live LLM call, so I could — and did — actually
run `python exercises/starter.py` end to end and confirm real output, not
just write code and hope. Full captured output is below.

## Real bugs found by actually running this

1. **`HfApiModel` doesn't exist in current `smolagents`** (installed
   `smolagents==1.26.0`, far ahead of the `>=0.2.1` pin). Renamed to
   `InferenceClientModel`. Confirmed by import error, then fixed.

2. **The token isn't read automatically from `HUGGINGFACEHUB_API_TOKEN`.**
   `InferenceClientModel` defaults to reading `HF_TOKEN`, not
   `HUGGINGFACEHUB_API_TOKEN` as both the original code comment and
   `.env.example` claim. Confirmed by reading the constructor source (same
   issue as the penguin-agents exercise). Fixed by passing
   `token=os.getenv("HUGGINGFACEHUB_API_TOKEN")` explicitly.

3. **`@tool` requires a full `Args:` docstring section per parameter, or it
   crashes at import time.** The exercise's own tool docstrings (e.g.
   `"""Return whether the slot is available."""` with no `Args:` block for
   `check_booking_availability(date, time)`) raise
   `DocstringParsingException` immediately — before the demo even starts.
   Fixed by adding `Args:` sections to all five tools.

4. **A real logic bug in the provided `diagnose_issue` method, not something I
   introduced.** The keyword-matching order checked Shop keywords
   (`"helmet"`, `"wheels"`, etc.) *before* Repair keywords
   (`"broken"`, `"damaged"`, `"repair"`). Since "helmet" is both a shop item
   name and a word that naturally appears in a damage report, **"My helmet is
   broken!" was misclassified as a Shop request, not a Repair request** —
   reproduced by actually running it through the original order. Fixed by
   checking Repair keywords first, since an explicit damage report is a more
   specific and decisive signal than a bare item-name mention.

5. **Em-dash characters in the response strings can crash on native Windows
   terminals** (cp1252 codepage), the same class of bug as the emoji crash in
   the penguin-agents exercise. Added the same `sys.stdout.reconfigure
   (encoding="utf-8")` guard defensively.

## Real captured output (from actually running `python exercises/starter.py`)

```
--- Demo in Action ---

Request 1: I want to book a skate session for 2025-09-12 at 10:00.
Response 1: Booking confirmed for Aisha on 2025-09-12 at 10:00.

Request 2: Do you have skateboards? Can I buy 2 skateboards?
Response 2: Sold 2 x skateboard! You're all set. (18 skateboard(s) remaining in stock.)

Request 3: My helmet is broken!
Response 3: Please describe the damage; we can assess repair or replacement. We'll connect you with our repair specialist in Nairobi.

Request 4: I'd like to book for 2025-09-12 at 10:00 too.
Response 4: Sorry, 2025-09-12 at 10:00 is already booked. The nearest open slot that day is 11:00 — would you like me to book that instead? (Reply with the same date and 11:00 to confirm.)

Request 5: Can I buy 100 wheels?
Response 5: Sorry, we only have 50 x wheels in stock right now — not enough to fulfill 100. Would you like fewer, or a different item?
```

Requests 4 and 5 were added beyond the original three-request demo
specifically to exercise the booking-conflict path (success criteria:
"handles conflicts") and the insufficient-stock path, since the original
three requests alone don't trigger either.

The reorder-threshold logging (hint: "if stock < 5 after a sale, trigger a
simple reorder print/log") was also verified separately — selling 26 helmets
(30 → 4, crossing the threshold of 5) correctly prints:
```
[reorder] Stock of 'helmet' is now 4, below threshold of 5 — flagging for reorder.
```

## What this does NOT exercise (would need your real HF token)

The `CustomerSupportAgent`, `InventoryAgent`, `ParkManagementAgent`, and
`Orchestrator` classes are still real `ToolCallingAgent` instances with tools
registered, satisfying the "implement orchestration patterns" architecture —
but `handle_request` doesn't call `.run()` on them for the demo's core logic,
by design (per the assignment's own hint to keep this deterministic). If you
want the model actually phrasing responses (rather than the string templates
here), that's a natural next step once you've confirmed a working
`HUGGINGFACEHUB_API_TOKEN` and an available model/provider on HF's free
Inference API — same caveat as the penguin-agents exercise: model/provider
availability on the free tier can be inconsistent, so check the model's page
on huggingface.co if `.run()` errors with "no provider available."
