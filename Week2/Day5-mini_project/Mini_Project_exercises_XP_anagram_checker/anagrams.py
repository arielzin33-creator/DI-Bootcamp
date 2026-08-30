# ==============================================================================
# anagrams.py
# ==============================================================================

import sys
from anagram_checker import AnagramChecker


def display_result(word, is_valid, anagrams):
    print("\n" + "─" * 45)
    print(f"  Word     : {word}")
    print(f"  Valid    : {'✓ Yes' if is_valid else '✗ No — not found in word list'}")
    if is_valid:
        if anagrams:
            print(f"  Anagrams : {', '.join(sorted(anagrams))}")
        else:
            print("  Anagrams : None found.")
    print("─" * 45)


def main():
    print("=" * 45)
    print("        Anagram Checker")
    print("=" * 45)

    try:
        checker = AnagramChecker("words.txt")
    except FileNotFoundError:
        print("Error: 'words.txt' not found. Please download the word list and place it in the same directory.")
        sys.exit(1)

    while True:
        print("\n  1. Check anagrams for a word")
        print("  2. Check if two words are anagrams")
        print("  3. Exit")
        choice = input("\n  Select an option (1-3): ").strip()

        if choice == "1":
            word = input("  Enter a word: ").strip()
            if not word:
                print("  Please enter a valid word.")
                continue
            is_valid  = checker.is_valid_word(word)
            anagrams  = checker.get_anagrams(word) if is_valid else []
            display_result(word, is_valid, anagrams)

        elif choice == "2":
            word1 = input("  Enter first word  : ").strip()
            word2 = input("  Enter second word : ").strip()
            if not word1 or not word2:
                print("  Please enter both words.")
                continue
            valid1   = checker.is_valid_word(word1)
            valid2   = checker.is_valid_word(word2)
            result   = checker.is_anagram(word1, word2)
            print("\n" + "─" * 45)
            print(f"  '{word1}' valid : {'✓' if valid1 else '✗'}")
            print(f"  '{word2}' valid : {'✓' if valid2 else '✗'}")
            if result:
                print(f"  ✓ '{word1}' and '{word2}' ARE anagrams of each other!")
            else:
                print(f"  ✗ '{word1}' and '{word2}' are NOT anagrams of each other.")
            print("─" * 45)

        elif choice == "3":
            print("\n  Goodbye!\n")
            sys.exit(0)

        else:
            print("  Invalid option. Please choose 1, 2, or 3.")


if __name__ == "__main__":
    main()