from Exercise_XP import Dog
import random


class PetDog(Dog):
    def __init__ (self, name, age, weight ):
        super().__init__(name, age, weight)
        self.trained = False

    def train(self):
        self.trained = True
        print(self.bark())

    def play(self, *args):
        dog_names = [self.name]
        for dog in args:
            dog_names.append(dog.name)
        print(f"{', '.join(dog_names)} all play together")

    def do_a_trick(self):
        if self.trained == True:
            tricks = ["does a barrel roll", "stands on his back legs", "shakes your hand", "plays dead"]
            print(f"{self.name} {random.choice(tricks)}")


