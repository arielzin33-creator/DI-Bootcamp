# #Daily Challenge: Coffee Shop Menu Manager

menu = {
    "espresso": 7.0,
    "latte": 12.0,
    "cappuccino": 10.0
}

def show_menu(menu_dict):
    print("Welcome to our Coffee Shop! Here's our menu:")
    if not menu_dict:
        print("The menu is empty.")
        return
    for item, price in menu_dict.items():
        print(f"{item.title()}: ${price:.2f}")

def add_item(menu_dict):
    item_name = input("Enter the name of the new menu item: ").strip()
    if item_name in menu_dict:
        print(f"{item_name.title()} already exists in the menu.")
        return
    else:
        item_price = float(input(f"Enter the price for {item_name.title()}: "))
        menu_dict[item_name] = item_price
        print(f"{item_name.title()} has been added to the menu.")
        
def update_item(menu_dict):
    item_name = input("Enter the name of the menu item to update: ").strip()
    if item_name in menu_dict:
        new_price = float(input(f"Enter the new price for {item_name.title()}: "))
        menu_dict[item_name] = new_price
        print(f"{item_name.title()} has been updated with the new price.")
    else:
        print(f"{item_name.title()} does not exist in the menu.")
        
def delete_item(menu_dict):
    item_name = input("Enter the name of the menu item to delete: ").strip()
    if item_name in menu_dict:
        del menu_dict[item_name]
        print(f"{item_name.title()} has been removed from the menu.")
    else:
        print(f"{item_name.title()} does not exist in the menu.")

      
def show_options():
    print("\nWhat would you like to do?")
    print("1. Show menu")
    print("2. Add item")
    print("3. Update price")
    print("4. Delete item")
    print("5. Exit")


def  run_coffee_shop():
    while True:
        show_options()
        choice = input("Enter your choice (1-5): ").strip()
        
        if choice == '1':
            show_menu(menu)
        elif choice == '2':
            add_item(menu)
        elif choice == '3':
            update_item(menu)
        elif choice == '4':
            delete_item(menu)
        elif choice == '5':
            print("Goodbye!")
            break
        else:
            print("Invalid choice, try again.")
            
run_coffee_shop()