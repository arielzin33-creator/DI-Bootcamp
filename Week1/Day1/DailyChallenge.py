
user_string = str(input("Enter a string: "))

if len(user_string) < 10:
    print ("String not long enough")
elif len(user_string) > 10:
    print ("String too long")
else:
    print ("Perfect string")
    print ("first character", user_string [0])
    print ("last character", user_string [-1])
    constructed_string = ""
    for char in user_string:
        constructed_string += char + ""
        print (constructed_string)