import random
import string
import datetime
import Faker

#Exercise 1: Currencies
Goal: Implement dunder methods for a Currency class to handle string representation, integer conversion, addition, and in-place addition.

class Currency:
    def __init__(self, currency, amount):
        self.currency = currency
        self.amount = amount


    def __str__(self):
        return f"{self.amount} {self.currency}s"

    def __int__ (self):
        return int(self.amount)

    def __repr__(self):
        return f"'{self.amount} {self.currency}s'"       

    def __add__(self, other):
                if isinstance(other, int):
                    return self.amount + other

    def __add__(self, other):
        if isinstance(other, Currency) and self.currency != other.currency:
                print(f"Cannot add between Currency type <{self.currency}> and <{other.currency}>")
        if isinstance(other, Currency) and self.currency == other.currency:
            return self.amount + other_amount

    def __iadd__(self, other):
        if isinstance(other, int):
            self.amount += other
            return self
        if isinstance(other, Currency):
            if self.currency != other.currency:
                raise TypeError(f"Cannot add between Currency type <{self.currency}> and <{other.currency}>")
            self.amount += other.amount
            return self
        raise TypeError(f"Unsupported type: {type(other)}")


#Exercise 3: String module    

all_letters = string.ascii_letters

random_string = "".join(random.choices(all_letters, k=5))

print(random_string)  

#Exercise 4: Current Date

from datetime import date

def current_date ():
    current_date = date.today()
    print(f"Today's date is: {current_date.strftime('%B, %d, %Y')}")

current_date()  

#Exercise 5: Amount of time left until January 1st

from datetime import datetime

def time_until_new_year():
   
    now = datetime.now()
    next_new_year = datetime(now.year + 1, 1, 1)
    days_left = (next_new_year - now).days
    print(f"Days left until January 1st, {now.year + 1}: {days_left} days")

time_until_new_year()

#Exercise 6: Birthday and minutes
from datetime import datetime

def minutes_lived(birthdate):
    birth = datetime.strptime(birthdate, "%d/%m/%Y")
    now = datetime.now()
    
    time_lived = now - birth
    minutes = int(time_lived.total_seconds() / 60)
    
    print(f"You were born on {birth.strftime('%B %d, %Y')}")
    print(f"You have lived approximately {minutes:,} minutes!")

minutes_lived("02/03/1986")

#Exercise 7: Faker Module

from faker import Faker

faker = Faker()
users = []

def add_users(num_users):
    for _ in range(num_users):
        user = {
            "name":          fake.name(),
            "address":       fake.address(),
            "language_code": fake.language_code()
        }
        users.append(user)

add_users(5)

for user in users:
    print(user)
    print("---")