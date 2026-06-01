import random

wordslist = ['correction', 'childish', 'beach', 'python', 'assertive',
             'interference', 'complete', 'share', 'credit card', 'rush', 'south']
word = random.choice(wordslist)

### YOUR CODE STARTS FROM HERE ###

# Hangman Game

# Step 1: Hangman ASCII art stages (0 = none, 6 = full body)
HANGMAN_STAGES = [
    # Stage 0 - Empty gallows
    """
       -----
       |   |
       |
       |
       |
       |
    --------""",
    # Stage 1 - Head
    """
       -----
       |   |
       |   O
       |
       |
       |
    --------""",
    # Stage 2 - Body
    """
       -----
       |   |
       |   O
       |   |
       |
       |
    --------""",
    # Stage 3 - Left arm
    """
       -----
       |   |
       |   O
       |  /|
       |
       |
    --------""",
    # Stage 4 - Right arm
    """
       -----
       |   |
       |   O
       |  /|\\
       |
       |
    --------""",
    # Stage 5 - Left leg
    """
       -----
       |   |
       |   O
       |  /|\\
       |  /
       |
    --------""",
    # Stage 6 - Right leg (dead)
    """
       -----
       |   |
       |   O
       |  /|\\
       |  / \\
       |
    --------"""
]

BODY_PARTS = ["head", "body", "left arm", "right arm", "left leg", "right leg"]


# ----------------------------------------
# Helper Functions
# ----------------------------------------

def display_word(word, guessed_letters):
    """Show the word with guessed letters revealed and stars for unknown."""
    display = ""
    for char in word:
        if char == ' ':
            display += "  "        # preserve spaces in phrases
        elif char in guessed_letters:
            display += char + " "
        else:
            display += "* "
    return display.strip()


def is_word_solved(word, guessed_letters):
    """Return True if all letters in the word have been guessed."""
    return all(char in guessed_letters or char == ' ' for char in word)


def get_player_guess(guessed_letters):
    """Ask the player for a valid, new single letter."""
    while True:
        guess = input("  Guess a letter: ").strip().lower()

        if len(guess) != 1:
            print(" Please enter a single letter.\n")
        elif not guess.isalpha():
            print(" Please enter a letter, not a number or symbol.\n")
        elif guess in guessed_letters:
            print(f" You already guessed '{guess}'. Try a different letter.\n")
        else:
            return guess


# ----------------------------------------
# Main Game
# ----------------------------------------

def play_hangman():
    guessed_letters = set()
    wrong_guesses   = 0
    max_wrong       = 6

    print("\n" + "=" * 40)
    print("        Welcome to Hangman!")
    print("=" * 40)
    print(f"  The word has {len(word.replace(' ', ''))} letters", end="")
    print(f" (and a space)" if ' ' in word else "")
    print()

    while wrong_guesses < max_wrong:

        # Display current state
        print(HANGMAN_STAGES[wrong_guesses])
        print(f"\n  Word:    {display_word(word, guessed_letters)}")
        print(f"  Guessed: {', '.join(sorted(guessed_letters)) if guessed_letters else 'None'}")
        print(f"  Wrong guesses left: {max_wrong - wrong_guesses}\n")

        # Get player's guess
        guess = get_player_guess(guessed_letters)
        guessed_letters.add(guess)

        # Check if guess is correct
        if guess in word:
            print(f"\n Yes! '{guess}' is in the word!\n")

            if is_word_solved(word, guessed_letters):
                print(HANGMAN_STAGES[wrong_guesses])
                print(f"\n You solved it! The word was: '{word}'")
                print("  Well done!\n")
                return
        else:
            wrong_guesses += 1
            part = BODY_PARTS[wrong_guesses - 1]
            print(f"\n '{guess}' is not in the word. Adding {part} to the gallows.\n")

    # Player ran out of guesses
    print(HANGMAN_STAGES[max_wrong])
    print(f"\n Game over! The word was: '{word}'")
    print("  Better luck next time!\n")


# --- Run the game ---
play_hangman()