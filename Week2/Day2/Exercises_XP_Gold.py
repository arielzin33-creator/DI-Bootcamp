class BankAccount:
    def __init__(self, balance=0, username=None, password=None):
        self.balance = balance
        self.username = username
        self.password = password
        self.authenticated = False

    def authenticate(self, username, password):
        if username == self.username and password == self.password:
            self.authenticated = True

    def deposit(self, amount):
        if not self.authenticated:
            raise Exception("Authentication required before performing transactions.")
        if amount <= 0:
            raise Exception("Deposit amount must be a positive integer.")
        self.balance += amount

    def withdraw(self, amount):
        if not self.authenticated:
            raise Exception("Authentication required before performing transactions.")
        if amount <= 0:
            raise Exception("Withdrawal amount must be a positive integer.")
        self.balance -= amount


class MinimumBalanceAccount(BankAccount):
    def __init__(self, balance=0, username=None, password=None, minimum_balance=0):
        super().__init__(balance, username, password)
        self.minimum_balance = minimum_balance

    def withdraw(self, amount):
        if not self.authenticated:
            raise Exception("Authentication required before performing transactions.")
        if amount <= 0:
            raise Exception("Withdrawal amount must be a positive integer.")
        if self.balance - amount < self.minimum_balance:
            raise Exception(
                f"Insufficient funds. Balance cannot fall below the minimum balance of {self.minimum_balance}."
            )
        self.balance -= amount


class ATM:
    def __init__(self, account_list, try_limit):
        if not isinstance(account_list, list) or not all(
            isinstance(acc, BankAccount) for acc in account_list
        ):
            raise Exception("account_list must be a list of BankAccount or MinimumBalanceAccount instances.")

        try:
            if try_limit <= 0:
                raise Exception("try_limit must be a positive number.")
        except Exception as e:
            print(f"Invalid try_limit provided: {e}. Defaulting to 2.")
            try_limit = 2

        self.account_list = account_list
        self.try_limit = try_limit
        self.current_tries = 0
        self.show_main_menu()

    def show_main_menu(self):
        while True:
            print("\n--- ATM Main Menu ---")
            print("1. Log In")
            print("2. Exit")
            choice = input("Select an option: ").strip()

            if choice == "1":
                username = input("Enter username: ").strip()
                password = input("Enter password: ").strip()
                self.log_in(username, password)
            elif choice == "2":
                print("Thank you for using the ATM. Goodbye.")
                break
            else:
                print("Invalid option. Please try again.")

    def log_in(self, username, password):
        for account in self.account_list:
            account.authenticate(username, password)
            if account.authenticated:
                print(f"Welcome, {username}!")
                self.current_tries = 0
                self.show_account_menu(account)
                account.authenticated = False
                return

        self.current_tries += 1
        remaining = self.try_limit - self.current_tries

        if self.current_tries >= self.try_limit:
            print("Maximum login attempts reached. Shutting down.")
            import sys
            sys.exit()
        else:
            print(f"Invalid credentials. {remaining} attempt(s) remaining.")

    def show_account_menu(self, account):
        while True:
            print(f"\n--- Account Menu (Balance: {account.balance}) ---")
            print("1. Deposit")
            print("2. Withdraw")
            print("3. Exit to Main Menu")
            choice = input("Select an option: ").strip()

            if choice == "1":
                try:
                    amount = int(input("Enter deposit amount: ").strip())
                    account.deposit(amount)
                    print(f"Deposit successful. New balance: {account.balance}")
                except Exception as e:
                    print(f"Error: {e}")
            elif choice == "2":
                try:
                    amount = int(input("Enter withdrawal amount: ").strip())
                    account.withdraw(amount)
                    print(f"Withdrawal successful. New balance: {account.balance}")
                except Exception as e:
                    print(f"Error: {e}")
            elif choice == "3":
                print("Returning to main menu.")
                break
            else:
                print("Invalid option. Please try again.")


if __name__ == "__main__":
    acc1 = BankAccount(balance=1000, username="alice", password="pass123")
    acc2 = MinimumBalanceAccount(balance=500, username="bob", password="securepass", minimum_balance=100)

    atm = ATM(account_list=[acc1, acc2], try_limit=3)