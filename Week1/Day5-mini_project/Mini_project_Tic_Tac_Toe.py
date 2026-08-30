Board_list = [' ' for i in range(9)]

def print_board():
    print('-------------')
    for i in range(3):
        print('| ' + Board_list[3*i] + ' | ' + Board_list[3*i+1] + ' | ' + Board_list[3*i+2] + ' |')
        print('-------------')
        
def check_win(player):
    win_conditions = [(0, 1, 2), (3, 4, 5), (6, 7, 8), 
                      (0, 3, 6), (1, 4, 7), (2, 5, 8), 
                      (0, 4, 8), (2, 4, 6)]
    for condition in win_conditions:
        if Board_list[condition[0]] == Board_list[condition[1]] == Board_list[condition[2]] == player:
            return True
    return False    

def check_move(move):
    return Board_list[move] == ' '

def check_draw():
    return ' ' not in Board_list    

def tic_tac_toe():
    current_player = 'X'
    while True:
        print_board()
        move = int(input(f"Player {current_player}, enter your move (1-9): ")) - 1
        if check_move(move):
            Board_list[move] = current_player
            if check_win(current_player):
                print_board()
                print(f"Player {current_player} wins!")
                break
            elif check_draw():
                print_board()
                print("It's a draw!")
                break
            current_player = 'O' if current_player == 'X' else 'X'
        else:
            print("Invalid move. Try again.")
            
tic_tac_toe()

