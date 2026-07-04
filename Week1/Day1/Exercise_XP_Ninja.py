# my_text = """Lorem ipsum dolor sit amet, consectetur adipiscing elit,
# sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
# Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
# dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
# Excepteur sint occaecat cupidatat non proidentvbv,
# sunt in culpa qui officia deserunt mollit anim id est laborum."""

# my_text_length = len(my_text)   # store the value
# print(my_text_length)
record = 0
record_text = ""

while True:
    sentence = input("Enter the longest sentence you can without the letter 'A': ")

    if "a" in sentence.lower():
        print("Invalid! Your sentence contains the letter 'A'. Try again.\n")
        

    if len(sentence) > record:
        record = len(sentence)
        record_text = sentence
        print(f"Congratulations! New record: {record} characters!\n")
    else:
        print(f"Valid sentence ({len(sentence)} characters), but the record is still {record}. Keep trying!\n")