import os
import re
import sys
from datetime import datetime, timedelta
from typing import Dict, Optional

from dotenv import load_dotenv
from smolagents import InferenceClientModel, ToolCallingAgent, tool

# On Windows, the default console codepage (cp1252) can crash on non-ASCII
# characters like the em-dash (—) used in the response strings below. Force
# UTF-8 stdout so this runs the same on Windows, macOS, Linux, and Colab.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

load_dotenv()

# NOTE: `HfApiModel` (as named in the original exercise instructions) was removed
# from smolagents; the current class for the free HF Inference API is
# `InferenceClientModel`. It also does NOT read HUGGINGFACEHUB_API_TOKEN
# automatically (it looks for HF_TOKEN by default), so the token from .env is
# passed explicitly below.
model = InferenceClientModel(
    model_id=os.getenv("HF_MODEL_ID", "HuggingFaceH4/zephyr-7b-beta"),
    token=os.getenv("HUGGINGFACEHUB_API_TOKEN"),
)

REORDER_THRESHOLD = 5

KNOWN_ITEMS = ["skateboard", "helmet", "wheels"]


def _singularize(item: str) -> str:
    """Best-effort normalization so 'skateboards' matches inventory key 'skateboard'."""
    item = item.strip().lower()
    if item in KNOWN_ITEMS:
        return item
    if item.endswith("s") and item[:-1] in KNOWN_ITEMS:
        return item[:-1]
    return item


# ---------------------- Domain Models ----------------------
class BookingSystem:
    def __init__(self):
        self.bookings: Dict[str, Dict[str, str]] = {}

    def check_availability(self, date: str, time: str) -> bool:
        if date not in self.bookings:
            return True
        return time not in self.bookings[date]

    def add_booking(self, date: str, time: str, customer: str) -> bool:
        self.bookings.setdefault(date, {})
        self.bookings[date][time] = customer
        return True

    def get_bookings(self, date: str) -> Dict[str, str]:
        return self.bookings.get(date, {})


booking_system = BookingSystem()


@tool
def check_booking_availability(date: str, time: str) -> str:
    """Return whether the slot is available.

    Args:
        date: The booking date, in YYYY-MM-DD format.
        time: The booking time, in HH:MM 24-hour format.
    """
    return "available" if booking_system.check_availability(date, time) else "unavailable"


@tool
def add_new_booking(date: str, time: str, customer: str) -> str:
    """Add a booking and return a confirmation string.

    Args:
        date: The booking date, in YYYY-MM-DD format.
        time: The booking time, in HH:MM 24-hour format.
        customer: The name of the customer making the booking.
    """
    booking_system.add_booking(date, time, customer)
    return f"Booking confirmed for {customer} on {date} at {time}."


@tool
def get_all_bookings(date: str) -> Dict[str, str]:
    """Return all bookings for a date.

    Args:
        date: The date to look up bookings for, in YYYY-MM-DD format.
    """
    return booking_system.get_bookings(date)


class Inventory:
    def __init__(self):
        self.stock: Dict[str, int] = {
            "skateboard": 20,
            "helmet": 30,
            "wheels": 50,
        }

    def check_stock(self, item: str) -> int:
        return self.stock.get(item, 0)

    def sell_item(self, item: str, quantity: int) -> bool:
        if self.stock.get(item, 0) >= quantity:
            self.stock[item] -= quantity
            return True
        return False


inventory = Inventory()


@tool
def get_inventory_level(item: str) -> str:
    """Return the current stock level for an item.

    Args:
        item: The name of the item to check, e.g. "skateboard".
    """
    level = inventory.check_stock(item)
    return f"{item}:{level}"


@tool
def sell_inventory_item(item: str, quantity: int) -> str:
    """Sell a quantity of an item from inventory if enough stock is available.

    Args:
        item: The name of the item to sell, e.g. "skateboard".
        quantity: The number of units the customer wants to buy.
    """
    if inventory.sell_item(item, quantity):
        if inventory.check_stock(item) < REORDER_THRESHOLD:
            print(
                f"  [reorder] Stock of '{item}' is now {inventory.check_stock(item)}, "
                f"below threshold of {REORDER_THRESHOLD} — flagging for reorder."
            )
        return f"sold:{quantity}:{item}"
    return f"failed:{item}"


# ---------------------- Agents ----------------------
class CustomerSupportAgent(ToolCallingAgent):
    def __init__(self):
        super().__init__(
            tools=[],
            model=model,
            name="customer_support_agent",
            description="Diagnose customer intent and provide an initial response.",
        )

    def diagnose_issue(self, request: str) -> str:
        req = request.lower()
        # Repair keywords are checked first and are deliberately more specific/decisive than
        # a bare item-name mention: "my helmet is broken" should route to Repair, not Shop,
        # even though "helmet" also appears in the Shop keyword list below. Checking Shop
        # first (as originally written) misrouted every damage report that named an item —
        # confirmed by actually running "My helmet is broken!" through the original order.
        if any(k in req for k in ["broken", "damaged", "repair"]):
            return "Repair"
        if any(k in req for k in ["board", "skateboard", "helmet", "wheels", "buy", "stock"]):
            return "Shop"
        if any(k in req for k in ["rent", "session", "booking", "book", "park"]):
            return "Park"
        return "Unknown"

    def initial_response(self, diagnosis: str) -> str:
        mapping = {
            "Shop": "Sure — what item and quantity are you interested in?",
            "Park": "Great — what date (YYYY-MM-DD) and time (HH:MM) would you like?",
            "Repair": "Please describe the damage; we can assess repair or replacement.",
            "Unknown": "Could you clarify your request?",
        }
        return mapping.get(diagnosis, "Could you clarify your request?")


class InventoryAgent(ToolCallingAgent):
    def __init__(self):
        super().__init__(
            tools=[get_inventory_level, sell_inventory_item],
            model=model,
            name="inventory_agent",
            description="Manage stock levels and sell items.",
        )


class ParkManagementAgent(ToolCallingAgent):
    def __init__(self):
        super().__init__(
            tools=[check_booking_availability, add_new_booking, get_all_bookings],
            model=model,
            name="park_management_agent",
            description="Manage park bookings and schedules.",
        )


# ---------------------- Orchestrator ----------------------
class Orchestrator(ToolCallingAgent):
    def __init__(self):
        super().__init__(
            tools=[],
            model=model,
            name="orchestrator",
            description="Route customer requests to the right agents and compose responses.",
        )
        self.support = CustomerSupportAgent()
        self.inventory = InventoryAgent()
        self.park = ParkManagementAgent()

    def _handle_park_flow(self, user_request: str, customer_name: str, preface: str) -> str:
        date_match = re.search(r"\b\d{4}-\d{2}-\d{2}\b", user_request)
        time_match = re.search(r"\b\d{2}:\d{2}\b", user_request)

        if not (date_match and time_match):
            # Not enough info yet — ask for it, as the initial response already does.
            return preface

        date, time = date_match.group(0), time_match.group(0)

        if check_booking_availability(date, time) == "available":
            confirmation = add_new_booking(date, time, customer_name)
            return f"{confirmation}"

        # Slot taken — try a few nearby slots (+1h, +2h, +3h) within the same day.
        try:
            slot_dt = datetime.strptime(time, "%H:%M")
        except ValueError:
            return f"That slot on {date} at {time} is unavailable, and I couldn't parse the time to suggest an alternative."

        for offset_hours in (1, 2, 3):
            candidate_dt = slot_dt + timedelta(hours=offset_hours)
            if candidate_dt.day != slot_dt.day:
                break  # don't spill into the next day
            candidate_time = candidate_dt.strftime("%H:%M")
            if check_booking_availability(date, candidate_time) == "available":
                return (
                    f"Sorry, {date} at {time} is already booked. "
                    f"The nearest open slot that day is {candidate_time} — "
                    f"would you like me to book that instead? "
                    f"(Reply with the same date and {candidate_time} to confirm.)"
                )

        return (
            f"Sorry, {date} at {time} is already booked, and the next few hours that day "
            f"are also full. Could you try a different date?"
        )

    def _handle_shop_flow(self, user_request: str, preface: str) -> str:
        buy_match = re.search(r"\bbuy\s+(\d+)\s+(\w+)\b", user_request.lower())

        if buy_match:
            quantity = int(buy_match.group(1))
            item = _singularize(buy_match.group(2))
            result = sell_inventory_item(item, quantity)

            if result.startswith("sold"):
                remaining = inventory.check_stock(item)
                return (
                    f"Sold {quantity} x {item}! You're all set. "
                    f"({remaining} {item}(s) remaining in stock.)"
                )
            current_stock = inventory.check_stock(item)
            return (
                f"Sorry, we only have {current_stock} x {item} in stock right now — "
                f"not enough to fulfill {quantity}. Would you like fewer, or a different item?"
            )

        # No explicit purchase — try to answer a stock-level question.
        mentioned_item = next(
            (candidate for candidate in KNOWN_ITEMS if candidate in user_request.lower()),
            "skateboard",  # plausible default per assignment instructions
        )
        level_report = get_inventory_level(mentioned_item)
        item, level = level_report.split(":")
        return f"{preface} We currently have {level} {item}(s) in stock."

    def handle_request(self, user_request: str, customer_name: str = "Guest") -> str:
        diagnosis = self.support.diagnose_issue(user_request)
        preface = self.support.initial_response(diagnosis)

        if diagnosis == "Park":
            return self._handle_park_flow(user_request, customer_name, preface)

        if diagnosis == "Shop":
            return self._handle_shop_flow(user_request, preface)

        if diagnosis == "Repair":
            return f"{preface} We'll connect you with our repair specialist in Nairobi."

        return f"{preface}"


# ---------------------- Demo ----------------------
if __name__ == "__main__":
    orch = Orchestrator()

    print("\n--- Demo in Action ---\n")
    req1 = "I want to book a skate session for 2025-09-12 at 10:00."
    print("Request 1:", req1)
    print("Response 1:", orch.handle_request(req1, customer_name="Aisha"))

    req2 = "Do you have skateboards? Can I buy 2 skateboards?"
    print("\nRequest 2:", req2)
    print("Response 2:", orch.handle_request(req2, customer_name="Brian"))

    req3 = "My helmet is broken!"
    print("\nRequest 3:", req3)
    print("Response 3:", orch.handle_request(req3, customer_name="Cynthia"))

    # Extra: exercise the conflict-handling path against the booking made in Request 1.
    req4 = "I'd like to book for 2025-09-12 at 10:00 too."
    print("\nRequest 4:", req4)
    print("Response 4:", orch.handle_request(req4, customer_name="David"))

    # Extra: exercise the insufficient-stock path.
    req5 = "Can I buy 100 wheels?"
    print("\nRequest 5:", req5)
    print("Response 5:", orch.handle_request(req5, customer_name="Esther"))
