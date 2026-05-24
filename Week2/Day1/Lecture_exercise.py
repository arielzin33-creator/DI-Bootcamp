# # class Dog:
# #     pass

# # peanut = Dog{}
# # peanut.color = "brown"
# # peanut.name = "peanut butter"
# # print(peanut.name)

# # class Dog:
# #     def__init__(self):
# #         print("you made a dog")
        
        
# # peanut - Dog{}


# class Dog:
#     # Initializer / Instance Attributes
#     def __init__(self, name_of_the_dog):
#         print("A new dog has been initialized !")
#         print("His name is", name_of_the_dog)
# #         self.name = name_of_the_dog

# #     def bark(self):
# #         print(f"{self.name} barks ! WAF")
        
        
# class Person:
#   def __init__(self, name, age):
#     self.name = name
#     self.age = age

#   def show_details(self):
#     print("Hello my name is " + self.name)
    
#   def change_name(self, new_name):
#         self.name = new_name
#         print(f"the person new name is:" + new_name)
        
        

# first_person = Person("John", 36)
# first_person.show_details()
# first_person.change_name ("Teddy")

class BankAccount:

    def __init__(self, account_number, balance=0):
        self.account_number = account_number
        self.balance = balance
        self.transactions = []

    def view_balance(self):
        self.transactions.append("View Balance")
        print(f"Balance for account {self.account_number}: {self.balance}")

    def deposit(self, amount):
        if amount <= 0:
            print("Invalid amount")
        elif amount < 100:
            print("Minimum deposit is 100")
        else:
            self.balance += amount
            self.transactions.append(f"Deposit: {amount}")
            print("Deposit Succcessful")

    def withdraw(self, amount):
        if amount > self.balance:
            print("Insufficient Funds")
        else:
            self.balance -= amount
            self.transactions.append(f"Withdraw: {amount}")
            print("Withdraw Approved")
            return amount

    def view_transactions(self):
        print("Transactions:")
        print("-------------")
        for transaction in self.transactions:
            print(transaction)

Joe_bank = 