# Exercise 1: Pets

class Pets():
    def __init__(self, animals):
        self.animals = animals

    def walk(self):
        for animal in self.animals:
            print(animal.walk())

class Cat(Pets):
    is_lazy = True

    def __init__(self, name, age):
        self.name = name
        self.age = age

    def walk(self):
        return f'{self.name} is just walking around'

class Siamese (Cat):
    def sing(self, sounds):
        return f'{sounds}'
    
class Bengal(Cat):
    def sing(self, sounds):
        return f'{sounds}'

class Chartreux(Cat):
    def sing(self, sounds):
        return f'{sounds}'
    
all_cats = [Bengal("Simba", 3), Chartreux("Luna", 5), Siamese("Nala", 2)]
sara_pets = Pets(all_cats)
sara_pets.walk()

# Exercise 2: Dogs
class Dog:
    def __init__ (self, name, age, weight):
        self.name = name
        self.age = age
        self.weight = weight
    
    def bark (self):
        return (f"{self.name} is barking")

    def run_speed (self):
        return self.weight / self.age * 10

    def fight(self, other_dog):
        my_dog =  self.run_speed() * self.weight
        the_other_dog =  other_dog.run_speed() * other_dog.weight
        if my_dog > the_other_dog:
            return f"{self.name} won the fight against {other_dog.name}!"
        elif the_other_dog > my_dog:
            return f"{other_dog.name} won the fight against {self.name}!"
        else:
            return f"It's a tie between {self.name} and {other_dog.name}!"
        
dog1 = Dog("Rex",   3, 30)
dog2 = Dog("Buddy", 5, 20)

print(dog1.bark())           
print(dog1.run_speed())      
print(dog2.run_speed())     
print(dog1.fight(dog2))      

# Exercise 4: Family and Person Classes

class Person:
    def __init__ (self, first_name, age):
        self.first_name = first_name
        self.age = age
        self.last_name = ""

    def is_18(self):
        if self.age >=18:
            return True
        else:
            return False
    
class family:
    def __init__ (self,last_name):
        self.last_name = last_name
        self.members = []

    def born(self, first_name, age):
        new_person = Person(first_name, age)
        new_person.last_name = self.last_name
        self.members.append(new_person)
        print(f"Welcome to the family, {first_name} {self.last_name}!")

    def check_majority(self, first_name):
        for member in self.members:
            if member.first_name == first_name:
                if member.is_18():
                    print(f"You are over 18, your parents Jane and John accept that you will go out with your friends")
                else:
                    print(f"Sorry, you are not allowed to go out with your friends.")
                return
        print(f"{first_name} is not a member of the {self.last_name} family.")

    def family_presentation(self):
        print(f"\nFamily: {self.last_name}")
       
        for member in self.members:
            print(f"{member.first_name} {member.last_name}, age {member.age}")