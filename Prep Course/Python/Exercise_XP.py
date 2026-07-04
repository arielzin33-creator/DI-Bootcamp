# # Exercise 1: Boolean Logic

# # Instructions
# # Complete the exercises below by writing an expression in Python to answer the question:

# # Declare a variable called first and assign it to the value "Hello World".
# first = "Hello World"

# # Write a comment that says "This is a comment."
# #this is a comment

# # Log a message to the terminal that says "I AM A COMPUTER!"
# print("I AM A COMPUTER!")

# # Write an if statement that checks if 1 is less than 2 and if 4 is greater than 2. If it is, show the message "Math is fun."
# if 1 <2 and 4 > 2:
#     print("Math is fun.")

# # Assign a variable called nope to an absence of value.
# nope = None

# # Use the language’s “and” boolean operator to combine the language’s “true” value with its “false” value.
# #1 == 6 and "true" = "true"

# # Calculate the length of the string "What's my length?"
# str_length = "What's my length?"
# print(len("What's my length?"))

# # Convert the string "i am shouting" to uppercase.
# str0 = "i am shouting"
# str1 = str0.upper()
# print(str1)

# # Convert the string "1000"to the number 1000.
# print (int("1000"))

# # Combine the number 4 with the string "real" to produce "4real".
# print(str(4) + "real")

# # Record the output of the expression 3 * "cool".
# #coolcoolcool
# print(3 * "cool")

# # Record the output of the expression 1 / 0.
# #unidentified

# # Determine the type of [].
# #list

# # Ask the user for their name, and store it in a variable called name.
# name = input("enter your name: ")

# # Ask the user for a number. If the number is negative, show a message that says "That number is less than 0!" If the number is positive, show a message that says "That number is greater than 0!" Otherwise, show a message that says "You picked 0!.
# num = int(input("Enter a number"))
# if num < 0:
#     print("That number is less than 0!")
# elif num > 0:
#     print("That number is greater than 0!")
# else:
#     print("You picked 0!")

# # Find the index of "l" in "apple".
# word = "apple"
# for char in word:
#     if char == "l":
#         print(word.index("l"))

# # Check whether "y" is in "xylophone".
# word = "xylophone"

# for char in word:
#     if char == "y":
#         print("y is in xylophone")
      

# # Check whether a string called my_string is all in lowercase.
# my_string = "my_string"
# if my_string.lower() == True:
#     print("my_string is  all in lowercase")
# else:
#     print("my_string is not all in lowercase")

#Exercise 2: cat's and dog's years


def calculate_pet_years(human_years):
    cat_years = 0
    dog_years = 0
#Cat Years 15 cat years for first year +9 cat years for second year +4 cat years for each year after that

#Dog Years 15 dog years for first year +9 dog years for second year +5 dog years for each year after that



    if human_years <= 0:
        return [human_years, 0, 0]

    if human_years == 1:
        cat_years = 15
        dog_years = 15
    elif human_years == 2:
        cat_years = 15 + 9  # 24
        dog_years = 15 + 9  # 24
    else:
        # 24 years for the first two years + the remaining years multiplied by the multiplier
        cat_years = 24 + ((human_years - 2) * 4)
        dog_years = 24 + ((human_years - 2) * 5)

    return [human_years, cat_years, dog_years]

age_array = calculate_pet_years(10)
print(age_array)  # Output: [10, 56, 64]

# Test Case 2: 1 year
age_array = calculate_pet_years(1)
print(age_array)  # Output: [1, 15, 15]

# Test Case 3: 2 years
age_array = calculate_pet_years(2)
print(age_array)  # Output: [2, 24, 24]