
# Exercise 1: Favorite Numbers

my_fav_numbers = set([7, 13, 42, 97, 47, 0])
my_fav_numbers.add(67)
my_fav_numbers.add(89)
my_fav_numbers.add(23)
print(my_fav_numbers)
my_fav_numbers.remove(0)
friend_fav_numbers = set(my_fav_numbers)

print(friend_fav_numbers)

our_fav_numbers = my_fav_numbers.union(friend_fav_numbers)
print(our_fav_numbers)  


# Exercise 2: Tuple

My_Tuple = (1, 2, 3)
print(My_Tuple)
List_1 = list(My_Tuple)
List_1.append(4)
print(List_1)
My_Tuple = tuple(List_1)
print(My_Tuple)   
 
 
#  Exercise 3: List Manipulation

basket = ["Banana", "Apples", "Oranges", "Blueberries"]
basket.remove("Banana")
basket.remove("Blueberries")
print(basket)
basket.append("Kiwi")
print(basket)   
basket.insert(0, "Apples")
print(basket)       
print(basket.count("Apples"))
basket.clear()
print(basket)


# Exercise 4: Floats

my_list = []
num=1.5
while num <=5:
    my_list.append(num)
    num += 0.5  
    my_list[-1] = int(my_list[-1]) if my_list[-1] % 1 == 0 else my_list[-1]
print(my_list)


# Exercise 5: For Loop

for i in range (1,21):
    print(i)

for i in range (1,21):
   if i % 2 ==0:
       print(i)
       
       
# Exercise 6: While Loop
     
user_name = input("Enter your name: ")
while user_name.isdigit() == True:
    user_name = input("Enter your name: ")

print("Thank you")


# Exercise 7: Favorite Fruits

fav_fruits_list = input("Enter your favorite fruits, separated by spaces: ")
user_fruit = input("Enter a fruit: ")
if user_fruit in fav_fruits_list:
    print("You chose one of your favorite fruits! Enjoy!")
else:
    print("You chose a new fruit. I hope you enjoy it")
    
    
# Exercise 8: Pizza Toppings

Toppings = ""
Toppings_list = []

while Toppings != "quit":
    Toppings = input("Enter a pizza topping (or 'quit' to finish): ")
    if Toppings != "quit":
        print(f"Adding {Toppings} to your pizza.")
        Toppings_list.append(Toppings)
print(f"Your pizza has the following toppings: {Toppings_list}")

total_price = 10 + 2.5 * len(Toppings_list)
print(f"The total price of your pizza is: ${total_price}")


# Exercise 9: Cinemax Tickets

Kid_counter = 0
Grownup_counter = 0
member_age = ""
family_members = int(input("How many family members? "))
for _ in range(family_members):
    while member_age != "quit":
        print("Enter the age of each family member (or 'quit' to finish):")
        member_age = int(input("Enter your age (or 'quit' to finish): "))
        if member_age != int:
            break
    if member_age > 3 and member_age < 12:
        Kid_counter += 1
    elif member_age >= 12:
        Grownup_counter += 1

total_price = 10 * Kid_counter + 15 * Grownup_counter
print(f"The total price of the tickets is: ${total_price}")