class Farm:
    def __init__ (self, farm_name):
        self.name = farm_name
        self.animals = {}

    def add_animal (self,animal_type, count=1):
        #If the animal_type already exists in the animals dictionary, increment its count by count
        if animal_type in  self.animals:
            self.animals[animal_type] += count
        else:
            self.animals[animal_type] = count

    def get_info(self):
        print(f"{self.name}'s farm has:")
        for animal, count in self.animals.items():
            print(f"  {animal} : {count}")

        print("E-I-E-I-0!")
     
# Test the code 
macdonald = Farm("McDonald")
macdonald.add_animal('cow', 5)
macdonald.add_animal('sheep')
macdonald.add_animal('sheep')
macdonald.add_animal('goat', 12)
print(macdonald.get_info())