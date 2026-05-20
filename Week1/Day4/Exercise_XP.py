#Exercise 1: What Are You Learning?
def display_message():
    print("I am learning about functions in Python.")
    
display_message()

# Exercise 2: What’s Your Favorite Book?
def favorite_book():
    title = input("What is your favorite book? ")
    print(f"One of my favorite books is {title}")
    
favorite_book()

# Exercise 3: Some Geography
def describe_city(city, country="Unknown"):
    print(f"{city} is in {country}.")
    
describe_city("Paris", "France")
describe_city("Tokyo") 

#Exercise 4: Random
import random
def get_random_num():
    num1 = int(input("Enter a number between 1 and 100: "))
    num2 = random.randint(1, 100)

    print(f"Number 1: {num1}")
    print(f"Number 2: {num2}")

    if num1 == num2:
        print("Success! The numbers are the same.")
    else:
        print("The numbers are different.")
    
get_random_num()
    
# Exercise 5: Let’s Create Some Personalized Shirts!
def make_shirt(size='large', text= 'I love Python.'):
    print(f"The shirt size is {size} and the text on the shirt is {text}")
    
make_shirt()
make_shirt("Medium")
make_shirt("small", "Python is great!")
make_shirt(size="small", text="Hello!")

#Exercise 6: Magicians…
magician_names = ['Harry Houdini', 'David Copperfield', 'Penn Jillette', 'Teller']
def show_magicians(names):
    for name in names:
        print(name) 
        
def make_great():
    for i in range(len(magician_names)):
        magician_names[i] = magician_names[i] + " the Great"

make_great()
show_magicians(magician_names)

# Exercise 7: Temperature Advice

def get_random_temp():
    import random
    return random.randint(-10, 40)

def main():
    temp = get_random_temp()
    print(f"The current temperature is {temp}°C.")
    
    if temp < 0:
        print("Brrr, that’s freezing! Wear some extra layers today")
    elif 0 <= temp < 16:
        print("Quite chilly! Don’t forget your coat")
    elif 16 <= temp < 23:
        print("Nice weather")
    elif 24 <= temp < 32:
        print("A bit warm, stay hydrated")
    else:
        print("It's quite hot! Stay cool!")
        

def get_random_temp2():
    import random  
    temp = random.uniform(-10, 40)
    print(f"The current temperature is {temp: .2f}°C.")
    
get_random_temp2()

