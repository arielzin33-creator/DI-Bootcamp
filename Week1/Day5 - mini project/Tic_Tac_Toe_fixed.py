# Tic Tac Toe - Two Player Game


# Step 1: Representing the Game Board
def create_board():
    return [[' ' for _ in range(3)] for _ in range(3)]


# Step 2: Displaying the Game Board
def display_board(board):
    print("\n  Col  1   2   3")
    print("       ---------")
    for i, row in enumerate(board):
        print(f"Row {i+1} | {row[0]} | {row[1]} | {row[2]} |")
        print("       ---------")
    print()


# Step 3: Getting Player Input
def player_input(board, player):
    while True:
        try:
            row = int(input(f"Player {player} — enter row (1-3): ")) - 1
            col = int(input(f"Player {player} — enter column (1-3): ")) - 1

            if row not in range(3) or col not in range(3):
                print("Out of range. Please enter numbers between 1 and 3.\n")
            elif board[row][col] != ' ':
                print("That cell is already taken. Choose another.\n")
            else:
                return row, col

        except ValueError:
            print("Invalid input. Please enter a number.\n")


# Step 4: Checking for a Winner
def check_win(board, player):
    # Check rows
    for row in board:
        if all(cell == player for cell in row):
            return True

    # Check columns
    for col in range(3):
        if all(board[row][col] == player for row in range(3)):
            return True

    # Check diagonals
    if all(board[i][i] == player for i in range(3)):
        return True
    if all(board[i][2 - i] == player for i in range(3)):
        return True

    return False


# Step 5: Checking for a Tie
def check_tie(board):
    return all(board[row][col] != ' ' for row in range(3) for col in range(3))


# Step 6: The Main Game Loop
def play():
    print("=" * 30)
    print("   Welcome to Tic Tac Toe!")
    print("=" * 30)

    board   = create_board()
    players = ['X', 'O']
    turn    = 0

    while True:
        current_player = players[turn % 2]

        display_board(board)
        print(f"  Player {current_player}'s turn")

        row, col = player_input(board, current_player)
        board[row][col] = current_player

        if check_win(board, current_player):
            display_board(board)
            print(f"Player {current_player} wins! Congratulations!\n")
            break

        if check_tie(board):
            display_board(board)
            print("It's a tie! Well played both!\n")
            break

        turn += 1


# --- Run the game ---
play()