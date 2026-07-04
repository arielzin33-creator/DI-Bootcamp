#Exam 1 : Number Guessing Game Project

import random

def number_guessing_game():
    random_number = random.randint(1, 100)
    max_attempts  = 7

    for attempt in range(1, max_attempts + 1):
        guess = int(input("Guess a number between 1 and 100: "))

        if guess < random_number:
            print("Too low!")
        elif guess > random_number:
            print("Too high!")
        else:
            print(f"Congratulations! You guessed the number in {attempt} attempt(s)!")
            break
    else:
        print(f"Sorry, you've used all {max_attempts} attempts. The number was {random_number}.")

number_guessing_game()