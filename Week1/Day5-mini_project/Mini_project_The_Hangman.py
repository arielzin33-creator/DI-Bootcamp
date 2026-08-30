import random

wordslist = ['correction', 'childish', 'beach', 'python', 'assertive',
             'interference', 'complete', 'share', 'credit card', 'rush', 'south']
word = random.choice(wordslist)

### YOUR CODE STARTS FROM HERE ###

# --- Gallows drawing stages (0 = empty, 6 = full figure) ---
STAGES = [
    # 0 wrong guesses
    """
   +---+
   |   |
       |
       |
       |
       |
=========
""",
    # 1 wrong guess — head
    """
   +---+
   |   |
   O   |
       |
       |
       |
=========
""",
    # 2 wrong guesses — head + body
    """
   +---+
   |   |
   O   |
   |   |
       |
       |
=========
""",
    # 3 wrong guesses — head + body + left arm
    """
   +---+
   |   |
   O   |
  /|   |
       |
       |
=========
""",
    # 4 wrong guesses — head + body + both arms
    """
   +---+
   |   |
   O   |
  /|\\  |
       |
       |
=========
""",
    # 5 wrong guesses — head + body + both arms + left leg
    """
   +---+
   |   |
   O   |
  /|\\  |
  /    |
       |
=========
""",
    # 6 wrong guesses — full figure (game over)
    """
   +---+
   |   |
   O   |
  /|\\  |
  / \\  |
       |
=========
""",
]

BODY_PARTS = ["head", "body", "left arm", "right arm", "left leg", "right leg"]
MAX_WRONG = len(BODY_PARTS)          # 6


def build_display(word: str, guessed: set) -> str:
    """Return the word with guessed letters revealed and the rest as '*'."""
    return " ".join(ch if (ch == " " or ch in guessed) else "*" for ch in word)


def play_hangman(word: str) -> None:
    guessed_letters: set = set()
    wrong_guesses:   int = 0
    word_lower = word.lower()

    print("\n" + "=" * 40)
    print("  Welcome to HANGMAN!")
    print("=" * 40)
    print(f"  The word/phrase has {len(word.replace(' ', ''))} letter(s).\n")

    while True:
        # --- Display current state ---
        print(STAGES[wrong_guesses])
        print("  Word: ", build_display(word_lower, guessed_letters))

        if guessed_letters:
            print("  Guessed letters:", ", ".join(sorted(guessed_letters)))

        # --- Check win condition ---
        if all(ch == " " or ch in guessed_letters for ch in word_lower):
            print(f"\n  You solved it!  The answer was: '{word}'\n")
            break

        # --- Check loss condition ---
        if wrong_guesses >= MAX_WRONG:
            print(f"\n  Game over!  The answer was: '{word}'\n")
            break

        remaining = MAX_WRONG - wrong_guesses
        print(f"\n  Wrong guesses left: {remaining}  "
              f"(next penalty: {BODY_PARTS[wrong_guesses]})")

        # --- Get player input ---
        guess = input("  Guess a letter: ").strip().lower()

        if len(guess) != 1 or not guess.isalpha():
            print("   Please enter a single alphabetic character.\n")
            continue

        if guess in guessed_letters:
            print(f"   You already guessed '{guess}'. Try another letter.\n")
            continue

        guessed_letters.add(guess)

        if guess in word_lower:
            count = word_lower.count(guess)
            positions = ", ".join(
                str(i + 1) for i, ch in enumerate(word_lower) if ch == guess
            )
            print(f" '{guess}' is in the word! "
                  f"({count} occurrence(s) at position(s): {positions})\n")
        else:
            wrong_guesses += 1
            part = BODY_PARTS[wrong_guesses - 1]
            print(f" '{guess}' is not in the word. "
                  f"Adding {part} to the gallows.\n")


# --- Entry point ---
if __name__ == "__main__":
    play_hangman(word)

    again = input("  Play again? (y/n): ").strip().lower()
    while again == "y":
        word = random.choice(wordslist)
        play_hangman(word)
        again = input("  Play again? (y/n): ").strip().lower()

    print("\n  Thanks for playing!\n")