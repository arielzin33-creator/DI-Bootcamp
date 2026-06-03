# ==============================================================================
# menu_manager.py
# ==============================================================================

import json

MENU_FILE = "restaurant_menu.json"

class MenuManager:
    def __init__(self):
        with open(MENU_FILE, "r") as f:
            self.menu = json.load(f)

    def add_item(self, name, price):
        self.menu["items"].append({"name": name, "price": price})

    def remove_item(self, name):
        for i, item in enumerate(self.menu["items"]):
            if item["name"].lower() == name.lower():
                del self.menu["items"][i]
                return True
        return False

    def save_to_file(self):
        with open(MENU_FILE, "w") as f:
            json.dump(self.menu, f, indent=4)

    def get_menu(self):
        return self.menu["items"]