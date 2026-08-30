from game import Game

def get_user_menu_choice():
    valid = ['Play a new game', 'Show scores', 'Quit']
    while True:
        user_choice = input("Please choose: 'Play a new game', 'Show scores', 'Quit': ").strip()
        if user_choice in valid:
            return user_choice
        print("Invalid input. Please choose a valid option.")

def print_results(game_obj):
    print(f"Wins: {game_obj.user_win}, Losses: {game_obj.user_loss}, Draws: {game_obj.user_draw}")
    print("Thanks for playing!")

def main():
    game_obj = Game()  # one object persists across games to keep scores
    while True:
        user_choice = get_user_menu_choice()
        if user_choice == 'Play a new game':
            game_obj.play()
        elif user_choice == 'Show scores':
            print_results(game_obj)
        elif user_choice == 'Quit':
            print_results(game_obj)
            return

if __name__ == "__main__":
    main()
    