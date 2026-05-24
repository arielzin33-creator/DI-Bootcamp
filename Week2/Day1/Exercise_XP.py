# # Exercise 1: Cats
class Cat:
    def __init__(self, cat_name, cat_age):
        self.name = cat_name
        self.age = cat_age

# Step 1: Create cat objects
# cat1 = create the object
cat1 = Cat("Afori", 19)
cat2 = Cat("Catomi", 17)
cat3 = Cat("Cheetah", 3)

# Step 2: Create a function to find the oldest cat
def find_oldest_cat(cat1, cat2, cat3):
    # ... code to find and return the oldest cat ...
    if cat1.age > cat2.age and cat1.age > cat3.age:
        return(cat1)
    if cat2.age > cat1.age and cat2.age > cat3.age:
        return(cat2)
    else:
        return(cat3)


# Step 3: Print the oldest cat's details

oldest = find_oldest_cat(cat1, cat2, cat3)
print(f"The oldest cat is {oldest.name}, and is {oldest.age} years old.")

# Exercise 2: Dogs

class Dog:
    # Initializer / Instance Attributes
    def __init__(self, name, height):
        self.name = name
        self.height = height

    def bark(self):
        print(f"{self.name} goes Woof!")

    def jump(self):
         print(f"{self.name} jumps {self.height * 2} cm high!")

# Step 2: Create Dog Objects             
davids_dog = Dog("Barky", 90)
sarahs_dog = Dog("Lady", 70)       

# Step 3: Print Dog Details and Call Methods
print(f"{davids_dog.name} is {davids_dog.height} cm tall.")
davids_dog.bark()
davids_dog.jump()

print(f"{sarahs_dog.name} is {sarahs_dog.height} cm tall.")
sarahs_dog.bark()
sarahs_dog.jump()

# Step 4: Compare Dog Sizes
if davids_dog.height > sarahs_dog.height:
    print(f"{davids_dog.name} is bigger than {sarahs_dog.name}.")
elif sarahs_dog.height > davids_dog.height:
    print(f"{sarahs_dog.name} is bigger than {davids_dog.name}.")
else:
    print("Both dogs are the same size.")

#Exercise 3 : Who’s the song producer?

class Song:
    def __init__(self, Lyrics):
        self.lyrics = lyrics

    def sing_me_a_song(self):
        for i in lyrics:
            print(i)

lyrics = ["Hit", "me", "baby", "one", "more", "time"]

My_song = Song(["Hit", "me", "baby", "one", "more", "time"])
print(My_song.sing_me_a_song())

#Exercise 4 : Afternoon at the Zoo


class zoo:
    def __init__(self,zoo_name):
         self.zoo_name = zoo_name
         self.animals = []

    def add_animal(self, new_animal):
            if new_animal in self.animals:
                print(f"{new_animal} is already in the zoo.")
            else:
                 self.animals.append(new_animal)

    def get_animals(self):
         print(f"the animals in the zoo are {self.animals}")

    def sell_animal(self,animal_sold):
         if animal_sold in self.animals:
            self.animals.remove(animal_sold)
            print(f"{animal_sold} has been sold from {self.zoo_name}.")
         else:
            print(f"{animal_sold} is not in the zoo.")
    
    def sort_animals(self):
         sorted_animals = sorted(self.animals)
         groups = {}
         for animal in sorted_animals:
                key = animal[0].upper()
         if key not in groups:
                groups[key] = []
                groups[key].append(animal)
                return groups

    def get_groups(self):
        groups = self.sort_animals()
        print(f"Animal groups in {self.zoo_name}:")
        for letter, group in groups.items():
            print(f"  {letter}: {group}")

Ramat_Gan_safari = zoo("Ramat Gan Safari")

# Step 3: Use the zoo methods
Ramat_Gan_safari.add_animal("Giraffe")
Ramat_Gan_safari.add_animal("Bear")
Ramat_Gan_safari.add_animal("Baboon")
Ramat_Gan_safari.get_animals()
Ramat_Gan_safari.sell_animal("Bear")
Ramat_Gan_safari.get_animals()
Ramat_Gan_safari.sort_animals()
Ramat_Gan_safari.get_groups()