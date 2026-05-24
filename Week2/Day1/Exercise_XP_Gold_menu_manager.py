class MenuManager:
    def __init__ (self):
        self.menu = [
            {"name": "Soup",              "price": 10, "spice": "B", "gluten": False},
            {"name": "Hamburger",         "price": 15, "spice": "A", "gluten": True},
            {"name": "Salad",             "price": 18, "spice": "A", "gluten": False},
            {"name": "French Fries",      "price": 5,  "spice": "C", "gluten": False},
            {"name": "Beef Bourguignon",  "price": 25, "spice": "B", "gluten": True},
        ]

    def add_item(self,name, price, spice, gluten):
        for dish in self.menu:
            if dish ["name"].lower() == name.lower():
                print(f"'{name}' is already on the menu.")
                return
        else:
            self.menu.append({
            "name": name,
            "price": price,
            "spice": spice,
            "gluten": gluten
        })
        print(f"'{name}' has been added to the menu.")
    
    def update_item(self, name, price, spice, gluten):
        for dish in self.menu:
            if dish["name"].lower() == name.lower():
                dish["price"] = price
                dish["spice"] = spice
                dish["gluten"] = gluten
                print(f"'{name}' has been updated successfully.")
                return
        print(f"'{name}' is not on the menu.")

    def remove_item(self, name):
        for dish in self.menu:
            if dish["name"].lower() == name.lower():
                self.menu.remove(dish)
                print(f"'{name}' has been removed from the menu.")
               
                return
        print(f"'{name}' is not on the menu.")

manager = MenuManager()

manager.add_item("Pasta", 20, "A", False)
manager.add_item("Soup", 10, "B", False)    
manager.update_item("Salad", 22, "B", False)
manager.update_item("Pizza", 30, "A", True)  # not on menu test

manager.remove_item("French Fries")
manager.remove_item("Sushi") 

print(manager.menu)