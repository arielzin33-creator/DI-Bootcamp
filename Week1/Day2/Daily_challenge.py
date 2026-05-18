# #daily challenge

#Challenge 1: Multiples of a Number
user_num = int(input("Enter a number: "))
user_length = int(input("Enter the length of the multiples: "))
multiples_list = []
for i in range(user_length):
    multiples_list.append(user_num * (i + 1))
print(f"The first {user_length} multiples of {user_num} are: {multiples_list}")

#Challenge 2: Remove Consecutive Duplicate Letters

user_string = str(input("Enter a string: "))
correct_string = user_string [0]

for i in range(1,len(user_string)):
    if user_string[i] != user_string[i - 1]:
        correct_string += user_string[i]

print(f"The string with consecutive duplicate letters removed is: {correct_string}")