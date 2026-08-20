import json
import os
import random
import re
import sys
from typing import Any, Dict

from dotenv import load_dotenv
from smolagents import InferenceClientModel, ToolCallingAgent, tool

# On Windows, the default console codepage (cp1252) can't encode emoji used in
# the log output below (🐟, 🔄, 🔨), crashing with UnicodeEncodeError. Force
# UTF-8 stdout so this runs the same on Windows, macOS, Linux, and Colab.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

load_dotenv()

# --- Model setup -----------------------------------------------------------
# NOTE: `HfApiModel` (as named in the original exercise instructions) was removed
# from smolagents; the current class for the free HF Inference API is
# `InferenceClientModel`. It also does NOT read HF_API_TOKEN automatically (it
# looks for HF_TOKEN by default), so the token from .env is passed explicitly.
model = InferenceClientModel(
    model_id=os.getenv("HF_MODEL_ID", "HuggingFaceH4/zephyr-7b-beta"),
    token=os.getenv("HF_API_TOKEN"),
)

# Global state for simplicity
DISTRIBUTION_HISTORY: Dict[str, list] = {}


@tool
def check_history(penguin_name: str) -> Dict[str, Any]:
    """Check the recent resource distribution history for a specific penguin.

    Args:
        penguin_name: The name of the penguin whose history should be checked.
    """
    history = DISTRIBUTION_HISTORY.get(penguin_name, [])
    recent_food = sum(h["food"] for h in history[-3:]) if history else 0
    has_tool = any(h["has_tool"] for h in history) if history else False
    return {"recent_food": recent_food, "has_tool": has_tool}


@tool
def record_distribution(penguin_name: str, food: int, has_tool: bool) -> str:
    """Record the distribution of resources given to a penguin.

    Args:
        penguin_name: The name of the penguin receiving resources.
        food: The amount of food given.
        has_tool: Whether a tool was given.
    """
    if penguin_name not in DISTRIBUTION_HISTORY:
        DISTRIBUTION_HISTORY[penguin_name] = []
    DISTRIBUTION_HISTORY[penguin_name].append({"food": food, "has_tool": has_tool})
    return f"Recorded: {penguin_name} got {food} food and {'a' if has_tool else 'no'} tool"


@tool
def find_food(penguin_name: str, method: str) -> int:
    """Search for food using a given method and return the amount found.

    Fishing yields more food (2-7) than foraging (0-3), reflecting that a
    penguin with a tool (better suited for fishing) has a resource advantage.

    Args:
        penguin_name: The name of the penguin searching for food.
        method: The search method to use, either "fishing" or "foraging".
    """
    if method == "fishing":
        amount = random.randint(2, 7)
    else:
        amount = random.randint(0, 3)
    print(f"  🐟 {penguin_name} went {method} and found {amount} food.")
    return amount


class ScientistAgent(ToolCallingAgent):
    def __init__(self, initial_food_supply: int = 20, refresh_interval: int = 5) -> None:
        super().__init__(
            tools=[check_history, record_distribution],
            model=model,
            name="scientist",
            description="A scientist responding to penguin actions",
        )
        self.initial_food_supply = initial_food_supply
        self.food_supply = initial_food_supply
        self.tool_available = True
        self.refresh_interval = refresh_interval
        self.turn_counter = 0

    def refresh_resources(self):
        """Periodically refresh the scientist's food supply."""
        self.food_supply = self.initial_food_supply
        self.tool_available = True
        print("\n🔄 Scientist Resources Refreshed!")
        print(f"Food Supply Reset to: {self.food_supply}")
        print(f"Tool Availability Reset to: {self.tool_available}")

    def respond_to_action(self, penguin: "PenguinAgent", penguin_action: Dict[str, Any]) -> None:
        """Respond to a penguin's action."""
        self.turn_counter += 1
        if self.turn_counter % self.refresh_interval == 0:
            self.refresh_resources()

        print(f"\n--- Turn {self.turn_counter}: Scientist Responds to {penguin.name} ---")
        print(f"Penguin Action: {penguin_action}")
        print("Penguin State:")
        print(f"  - Food: {penguin.food}")
        print(f"  - Has Tool: {penguin.has_tool}")

        history = check_history(penguin.name)
        print("Penguin History:")
        print(f"  - Recent Food: {history['recent_food']}")
        print(f"  - Has Had Tool: {history['has_tool']}")

        print("\nScientist Resources:")
        print(f"  - Food Supply: {self.food_supply}")
        print(f"  - Tool Available: {self.tool_available}")

        response = self.run(
            f"""Penguin {penguin.name} took action: {penguin_action}
            Penguin's current state:
            - Food: {penguin.food}
            - Has Tool: {penguin.has_tool}

            Recent History: {history['recent_food']} recent food, {'has' if history['has_tool'] else 'no'} tool.
            Available Scientist Resources: {self.food_supply} food, Tool: {self.tool_available}

            Decide how much food and whether to give the tool. Respond with ONLY a JSON object,
            no markdown code fences, no extra text: {{"give_food": <0-5>, "give_tool": <true or false>}}"""
        )

        decision = _parse_json_response(response)
        try:
            food = min(int(decision.get("give_food", 0)), self.food_supply)
            give_tool = bool(decision.get("give_tool", False)) and self.tool_available

            print("\nScientist's Decision:")
            print(f"  - Food to Give: {food}")
            print(f"  - Tool to Give: {give_tool}")

            if food > 0:
                self.food_supply -= food
                penguin.food += food
            if give_tool:
                penguin.has_tool = True
                self.tool_available = False

            record_distribution(penguin.name, food, give_tool)

            print("\nPost-Action State:")
            print("Scientist Resources:")
            print(f"  - Remaining Food Supply: {self.food_supply}")
            print(f"  - Tool Available: {self.tool_available}")
            print(f"Penguin {penguin.name}:")
            print(f"  - Food: {penguin.food}")
            print(f"  - Has Tool: {penguin.has_tool}")
        except Exception as e:
            print(f"Error processing scientist's response: {e}")


def _parse_json_response(response: Any) -> Dict[str, Any]:
    """Robustly extract a JSON object from an LLM response.

    Handles: the response already being a dict, markdown code fences around
    the JSON, and stray text before/after the JSON object — all common with
    smaller open models that don't strictly follow "JSON only" instructions.
    """
    if isinstance(response, dict):
        return response

    text = str(response).strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    print(f"Could not parse JSON from response, using safe default. Raw response: {text!r}")
    return {}


class PenguinAgent(ToolCallingAgent):
    def __init__(self, name: str) -> None:
        super().__init__(tools=[find_food], model=model, name=name)
        self.name = name
        self.food = 0
        self.has_tool = False

    def take_action(self) -> Dict[str, Any]:
        """Penguin decides on an action each round."""
        history = check_history(self.name)

        low_food_threshold = 2
        strategy_hint = (
            "You are very low on food, so requesting food from the scientist (action "
            '"request_food") is a reasonable choice this round.'
            if self.food <= low_food_threshold
            else (
                'Prefer action "find_food" with method "fishing" since you have a tool and '
                "fishing yields more food than foraging."
                if self.has_tool
                else 'Prefer action "find_food" with method "foraging" since you have no tool yet.'
            )
        )

        prompt = f"""You are Penguin {self.name}.
        You have {self.food} food and {'have' if self.has_tool else 'do not have'} a tool.
        Recent history: {history['recent_food']} food gained recently.

        {strategy_hint}

        Decide your action this round. Respond with ONLY a JSON object, no markdown code fences,
        no extra text, in exactly this shape:
        {{"action": "find_food" or "request_food", "method": "fishing" or "foraging"}}"""

        response = self.run(prompt)
        decision = _parse_json_response(response)

        if "action" not in decision:
            print(f"Error processing {self.name}'s action; falling back to safe action.")
            return {"action": "request_food", "details": "default safe action"}
        return decision


def run_simulation():
    scientist = ScientistAgent(initial_food_supply=20, refresh_interval=5)
    penguins = [PenguinAgent(f"Penguin{i}") for i in range(4)]

    print("\nStarting Simulation...")
    for round_idx in range(3):
        print(f"\n{'=' * 50}")
        print(f"ROUND {round_idx + 1}")
        print(f"{'=' * 50}")

        # Penguins take actions
        penguin_actions = {}
        for penguin in penguins:
            action = penguin.take_action()
            penguin_actions[penguin.name] = action
            print(f"{penguin.name} Action: {action}")

        # Process Penguin Actions
        for penguin in penguins:
            act = penguin_actions[penguin.name].get("action")
            if act == "request_food":
                pass  # handled by scientist
            elif act == "find_food":
                food_found = find_food(
                    penguin.name, penguin_actions[penguin.name].get("method", "foraging")
                )
                penguin.food += food_found

        # Scientist responds to actions
        for penguin in penguins:
            scientist.respond_to_action(penguin, penguin_actions[penguin.name])

    print("\nFinal State:")
    print(f"Remaining: {scientist.food_supply} food, {'🔨' if scientist.tool_available else ''}")
    for penguin in penguins:
        hist = check_history(penguin.name)
        print(f"{penguin.name} - Total Food: {penguin.food}, Has Tool: {hist['has_tool']}")


if __name__ == "__main__":
    run_simulation()
