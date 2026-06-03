# ==============================================================================
# menu_editor.py
# ==============================================================================

import sys
from menu_manager import MenuManager

manager = None


def load_manager():
    global manager
    manager = MenuManager()


def show_restaurant_menu():
    print("\n── Restaurant Menu ───────────────────────────────")
    items = manager.get_menu()
    if not items:
        print("  The menu is currently empty.")
    else:
        print(f"  {'Item':<25} {'Price':>8}")
        print(f"  {'-'*25} {'-'*8}")
        for item in items:
            print(f"  {item['name']:<25} ${item['price']:>7.2f}")
    print()


def add_item_to_menu():
    name = input("  Enter item name  : ").strip()
    while True:
        try:
            price = float(input("  Enter item price : ").strip())
            if price < 0:
                print("  Price must be a positive number.")
                continue
            break
        except ValueError:
            print("  Invalid price. Please enter a number.")
    manager.add_item(name, price)
    print(f"  ✓ '{name}' was added successfully.\n")


def remove_item_from_menu():
    name = input("  Enter the name of the item to remove: ").strip()
    success = manager.remove_item(name)
    if success:
        print(f"  ✓ '{name}' was removed successfully.\n")
    else:
        print(f"  ✗ Error: '{name}' was not found in the menu.\n")


def show_user_menu():
    while True:
        print("=" * 50)
        print("       Restaurant Menu Manager")
        print("=" * 50)
        print("  1. View restaurant menu")
        print("  2. Add item to menu")
        print("  3. Remove item from menu")
        print("  4. Save and exit")
        print("=" * 50)

        choice = input("  Select an option (1-4): ").strip()

        if choice == "1":
            show_restaurant_menu()
        elif choice == "2":
            add_item_to_menu()
        elif choice == "3":
            remove_item_from_menu()
        elif choice == "4":
            manager.save_to_file()
            print("\n  ✓ Menu saved successfully. Goodbye!\n")
            sys.exit(0)
        else:
            print("  Invalid option. Please choose between 1 and 4.\n")


if __name__ == "__main__":
    load_manager()
    show_user_menu()