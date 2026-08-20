import os
os.environ.setdefault("HF_API_TOKEN", "fake-token-for-offline-structural-test")

import sys
sys.path.insert(0, "exercises")

import starter

print("=== Import test: PASSED (no DocstringParsingException) ===\n")

print("=== find_food test ===")
fishing_amounts = [starter.find_food("TestPenguin", "fishing") for _ in range(20)]
foraging_amounts = [starter.find_food("TestPenguin", "foraging") for _ in range(20)]
assert all(2 <= a <= 7 for a in fishing_amounts), f"fishing out of range: {fishing_amounts}"
assert all(0 <= a <= 3 for a in foraging_amounts), f"foraging out of range: {foraging_amounts}"
print(f"fishing range OK: min={min(fishing_amounts)} max={max(fishing_amounts)}")
print(f"foraging range OK: min={min(foraging_amounts)} max={max(foraging_amounts)}\n")

print("=== check_history / record_distribution test ===")
h0 = starter.check_history("Penguin0")
assert h0 == {"recent_food": 0, "has_tool": False}, h0
starter.record_distribution("Penguin0", 3, False)
starter.record_distribution("Penguin0", 2, True)
h1 = starter.check_history("Penguin0")
assert h1 == {"recent_food": 5, "has_tool": True}, h1
print("check_history/record_distribution state tracking OK:", h1, "\n")

print("=== _parse_json_response robustness test ===")
cases = [
    ('{"give_food": 3, "give_tool": true}', {"give_food": 3, "give_tool": True}),
    ('```json\n{"give_food": 3, "give_tool": true}\n```', {"give_food": 3, "give_tool": True}),
    ('Sure, here is my decision:\n{"give_food": 2, "give_tool": false}\nHope that helps!',
     {"give_food": 2, "give_tool": False}),
    ({"give_food": 1, "give_tool": False}, {"give_food": 1, "give_tool": False}),
    ("not json at all", {}),
]
for raw, expected in cases:
    result = starter._parse_json_response(raw)
    assert result == expected, f"input={raw!r} -> got {result}, expected {expected}"
print(f"All {len(cases)} JSON-parsing edge cases handled correctly.\n")

print("=== Agent construction test (no network call) ===")
scientist = starter.ScientistAgent(initial_food_supply=20, refresh_interval=5)
penguin = starter.PenguinAgent("Penguin0")
assert scientist.food_supply == 20
assert scientist.tool_available is True
assert penguin.food == 0
assert penguin.has_tool is False
assert len(penguin.tools) >= 1, "find_food tool not registered on PenguinAgent"
print("ScientistAgent constructed OK, tools:", list(scientist.tools.keys()))
print("PenguinAgent constructed OK, tools:", list(penguin.tools.keys()))

print("\n=== ALL OFFLINE STRUCTURAL TESTS PASSED ===")
