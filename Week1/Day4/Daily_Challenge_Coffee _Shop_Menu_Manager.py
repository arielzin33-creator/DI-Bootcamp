# Daily Challenge: Coffee Shop Menu Manager

menu = {
    "espresso": 7.0,
    "latte": 12.0,
    "cappuccino": 10.0
}

def show_menu(menu_dict):
    if not menu_dict:
        print("The menu is empty.")
        return
    print("\nCurrent menu:")
    for item, price in menu_dict.items():
        print(f"{item} - {price}₪")
    print()

def add_item(menu_dict):
    item_name = input("Enter new drink name: ").strip().lower()
    if item_name in menu_dict:
        print("Item already exists!")
        return
    item_price = float(input("Enter price: "))
    menu_dict[item_name] = item_price
    print(f'"{item_name}" added!')

def update_price(menu_dict):
    item_name = input("Enter the name of the menu item to update: ").strip().lower()
    if item_name in menu_dict:
        new_price = float(input(f"Enter the new price for {item_name}: "))
        menu_dict[item_name] = new_price
        print("Price updated!")
    else:
        print("Item not found.")

def delete_item(menu_dict):
    item_name = input("Enter the name of the menu item to delete: ").strip().lower()
    if item_name in menu_dict:
        del menu_dict[item_name]
        print("Item deleted.")
    else:
        print("Item not found.")

def show_options():
    print("What would you like to do?")
    print("1. Show menu")
    print("2. Add item")
    print("3. Update price")
    print("4. Delete item")
    print("5. Exit")

def run_coffee_shop():
    while True:
        show_options()
        choice = input("Choose (1-5): ").strip()

        if choice == '1':
            show_menu(menu)
        elif choice == '2':
            add_item(menu)
        elif choice == '3':
            update_price(menu)
        elif choice == '4':
            delete_item(menu)
        elif choice == '5':
            print("Goodbye!")
            break
        else:
            print("Invalid choice, try again.")

run_coffee_shop()
