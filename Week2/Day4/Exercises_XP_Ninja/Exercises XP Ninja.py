# ==============================================================================
# Exercise 1: Valentine's Menu Manager with Regex
# ==============================================================================

import json
import re

MENU_FILE = "restaurant_menu.json"


def load_menu():
    with open(MENU_FILE, "r") as f:
        return json.load(f)


def save_menu(data):
    with open(MENU_FILE, "w") as f:
        json.dump(data, f, indent=4)


def validate_valentine_item(name, price):
    errors = []

    # Rule 1 & 2: First word must start with capital V,
    # each content word uppercase, connection words lowercase
    connection_words = {"of", "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with"}
    words = re.split(r"[\s\-]+", name)

    if not words[0].startswith("V"):
        errors.append("The first word must begin with a capital 'V'.")

    for i, word in enumerate(words):
        clean = re.sub(r"[^a-zA-Z]", "", word)
        if not clean:
            continue
        if clean.lower() in connection_words and i != 0:
            if clean[0].isupper():
                errors.append(f"Connection word '{clean}' should be lowercase.")
        else:
            if not clean[0].isupper():
                errors.append(f"Word '{clean}' should start with an uppercase letter.")

    # Rule 3: At least two 'e' (case-insensitive), no numbers
    e_count = name.lower().count("e")
    if e_count < 2:
        errors.append(f"Name must contain at least two 'e' letters (found {e_count}).")
    if re.search(r"\d", name):
        errors.append("Name must not contain numbers.")

    # Rule 4: Price must match XX,14
    if not re.fullmatch(r"\d{2},14", price):
        errors.append("Price must match the pattern XX,14 (e.g. 25,14).")

    return errors


def draw_heart():
    heart = [
        "  ***   ***  ",
        " ***** ***** ",
        "*************",
        "*************",
        " *********** ",
        "  *********  ",
        "   *******   ",
        "    *****    ",
        "     ***     ",
        "      *      ",
    ]
    for line in heart:
        print(line)


def show_valentine_menu(data):
    draw_heart()
    print("\n💝 Valentine's Special Menu 💝")
    print("─" * 35)
    items = data.get("valentine_items", [])
    if not items:
        print("  No Valentine's items yet.")
    else:
        for item in items:
            print(f"  {item['name']:<28} {item['price']}")
    print()


def valentine_menu_manager():
    print("=" * 50)
    print("   Valentine's Day Menu Manager")
    print("=" * 50)

    data = load_menu()

    if "valentine_items" not in data:
        data["valentine_items"] = []
        save_menu(data)
        print("Created empty Valentine's items list in JSON.\n")

    show_valentine_menu(data)

    name  = input("Enter Valentine's item name  : ").strip()
    price = input("Enter price (format XX,14)   : ").strip()

    errors = validate_valentine_item(name, price)

    if errors:
        print("\n✗ Item rejected. Validation errors:")
        for err in errors:
            print(f"  - {err}")
    else:
        data["valentine_items"].append({"name": name, "price": price})
        save_menu(data)
        print(f"\n✓ '{name}' added to the Valentine's menu!")
        show_valentine_menu(data)


valentine_menu_manager()


# ==============================================================================
# Exercise 2: Dungeons & Dragons
# ==============================================================================

import random
import json
from datetime import datetime


class Character:
    ATTRIBUTES = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]

    def __init__(self, name, age):
        self.name = name
        self.age  = age
        self.stats = self._roll_stats()

    def _roll_four_dice(self):
        rolls = [random.randint(1, 6) for _ in range(4)]
        return sum(sorted(rolls)[1:])  # discard lowest

    def _roll_stats(self):
        return {attr: self._roll_four_dice() for attr in self.ATTRIBUTES}

    def to_dict(self):
        return {
            "name": self.name,
            "age":  self.age,
            "stats": self.stats
        }

    def to_text(self):
        lines = [
            "─" * 35,
            f"  Character : {self.name}",
            f"  Age       : {self.age}",
            "─" * 35,
        ]
        for attr, value in self.stats.items():
            bar = "█" * (value // 2)
            lines.append(f"  {attr:<15}: {value:>2}  {bar}")
        lines.append("─" * 35)
        return "\n".join(lines)

    def __repr__(self):
        return f"Character(name={self.name}, age={self.age}, stats={self.stats})"


class Game:
    def __init__(self):
        self.characters = []

    def run(self):
        print("\n" + "=" * 50)
        print("   ⚔️  Dungeons & Dragons Character Creator")
        print("=" * 50)

        while True:
            try:
                num_players = int(input("\nHow many players are playing? ").strip())
                if num_players < 1:
                    print("At least one player is required.")
                    continue
                break
            except ValueError:
                print("Please enter a valid number.")

        for i in range(1, num_players + 1):
            print(f"\n── Player {i} ──────────────────────────────────")
            name = input("  Enter your character's name : ").strip()
            while True:
                try:
                    age = int(input("  Enter your character's age  : ").strip())
                    if age < 1:
                        print("  Age must be a positive number.")
                        continue
                    break
                except ValueError:
                    print("  Please enter a valid age.")

            character = Character(name, age)
            self.characters.append(character)
            print(f"\n{character.to_text()}")

        self.export_txt()
        self.export_json()

    def export_txt(self):
        filename = "characters.txt"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(filename, "w") as f:
            f.write("=" * 35 + "\n")
            f.write("  D&D CHARACTER SHEETS\n")
            f.write(f"  Generated: {timestamp}\n")
            f.write("=" * 35 + "\n\n")
            for character in self.characters:
                f.write(character.to_text())
                f.write("\n\n")
        print(f"\n✓ Characters saved to '{filename}'.")

    def export_json(self):
        filename = "characters.json"
        data = {
            "generated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "players":   len(self.characters),
            "characters": [c.to_dict() for c in self.characters]
        }
        with open(filename, "w") as f:
            json.dump(data, f, indent=4)
        print(f"✓ Characters saved to '{filename}'.")


if __name__ == "__main__":
    game = Game()
    game.run()