    
# ==============================================================================
# game.py
# ==============================================================================
 
import random

class Game:
    def __init__(self):
        self.user_win  = 0
        self.user_loss = 0
        self.user_draw = 0

    def get_user_item(self):
        valid = ['rock', 'paper', 'scissors']
        while True:
            self.user_item = input("Enter an item (rock, paper, scissors): ").lower().strip()
            if self.user_item in valid:
                return self.user_item
            else:
                print("Invalid input. Please enter rock, paper, or scissors.")

    def get_computer_item(self):
        self.choice_list = ['rock', 'paper', 'scissors']
        self.comp_choice = random.choice(self.choice_list)
        return self.comp_choice

    def get_game_result(self, user_item, computer_item):
        self.user_item     = user_item
        self.computer_item = computer_item

        if self.user_item == 'rock' and self.computer_item == 'paper':
            self.user_loss += 1
            return 'loss'
        elif self.user_item == 'rock' and self.computer_item == 'scissors':
            self.user_win += 1
            return 'win'
        elif self.user_item == 'rock' and self.computer_item == 'rock':
            self.user_draw += 1
            return 'draw'
        elif self.user_item == 'paper' and self.computer_item == 'paper':
            self.user_draw += 1
            return 'draw'
        elif self.user_item == 'paper' and self.computer_item == 'scissors':
            self.user_loss += 1
            return 'loss'
        elif self.user_item == 'paper' and self.computer_item == 'rock':
            self.user_win += 1
            return 'win'
        elif self.user_item == 'scissors' and self.computer_item == 'paper':
            self.user_win += 1
            return 'win'
        elif self.user_item == 'scissors' and self.computer_item == 'scissors':
            self.user_draw += 1
            return 'draw'
        elif self.user_item == 'scissors' and self.computer_item == 'rock':
            self.user_loss += 1
            return 'loss'

    def play(self):
        user_item     = self.get_user_item()
        computer_item = self.get_computer_item()
        result        = self.get_game_result(user_item, computer_item)
        print(f"User: {user_item}, Computer: {computer_item}, Result: {result}")
        return result
    

