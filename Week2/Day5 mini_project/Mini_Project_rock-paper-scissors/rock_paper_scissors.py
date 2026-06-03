  # ==============================================================================
# rock-paper-scissors.py
# ==============================================================================

import sys
from game import Game


def get_user_menu_choice():
    print("\n" + "=" * 40)
    print("       Rock Paper Scissors")
    print("=" * 40)
    print("  1. Play a new game")
    print("  2. Show scores")
    print("  3. Quit")
    print("=" * 40)

    while True:
        choice = input("  Select an option (1-3): ").strip()
        if choice in ("1", "2", "3"):
            return choice
        print("  ✗ Invalid option. Please choose 1, 2, or 3.")


def print_results(results):
    total = sum(results.values())
    print("\n" + "=" * 40)
    print("         Game Summary")
    print("=" * 40)
    print(f"  Wins   : {results['win']}")
    print(f"  Losses : {results['loss']}")
    print(f"  Draws  : {results['draw']}")
    print(f"  Total  : {total} game(s) played")
    print("=" * 40)
    print("  Thanks for playing! See you next time. 👋")
    print()


def main():
    results = {"win": 0, "loss": 0, "draw": 0}

    while True:
        choice = get_user_menu_choice()

        if choice == "1":
            game   = Game()
            result = game.play()
            results[result] += 1

        elif choice == "2":
            print_results(results)

        elif choice == "3":
            print_results(results)
            sys.exit(0)


if __name__ == "__main__":
    main()