# class Animal():
#     def __init__(self, type, number_legs, sound):
#         self.type = type
#         self.number_legs = number_legs
#         self.sound = sound

#     def make_sound(self):
#         print(f"I am an animal, and I love saying {self.sound}")

# class Dog(Animal):
#     pass

# rex= Dog("dog", 4, "wouaf")
# print('This animal is a:', rex.type)
# # >> This animal is a dog

# print('This dog has', rex.number_legs , ' legs')
# # >> This dog has 4 legs

# print('This dog makes the sound ', rex.sound)
# # >> This dog makes the sound wouaf

# rex.make_sound()
# # >> I am an animal, and I love saying wouaf

# class door:
#     def __init__ (self, is_opened):
#        self.is_opened = is_opened
       
#     def open_door(self):
#         if self.is_opened == True:
#             print ("door is open")
#             self.is_opened = True
        
#     def close_door(self):
#         if self.is_opened == True:
#             print ("door closing")
#             self.is_opened = False
        
# class BlockedDoor (door):
#     def __init__ (self):
#        self.is_opened = False
#     def open_door(self):
#         print("ERROR -  blocked door cannot be opened or closed")
        
#     def close_door(self):
#         print("ERROR -  blocked door cannot be opened or closed")

my_list = [2,3,1,2,"four",42,1,5,3,"imanumber"]

def add (numbers):
        total = 0
        for number in numbers:
            try:
                total += number
            except:
                print ("error, malicious input")
                
        return total
        
total = add(my_list)
print(total)