#Challenge 1: Sorting
# Step 1: Get Input
words_input = input("Enter words separated by commas: ")

# Step 2: Split the String
words_list = words_input.split(',')

# Step 3: Sort the List
words_list.sort()

# Step 4: Join the Sorted List
sorted_string = ','.join(words_list)

# Step 5: Print the Result
print(sorted_string)

#Challenge 2: Longest Word

# Step 1: Define the Function
def longest_word(sentence):

    # Step 2: Split the Sentence into Words
    words = sentence.split()

    # Step 3: Initialize Variables
    longest = ""

    # Step 4 & 5: Iterate Through the Words and Compare Lengths
    for word in words:
        if len(word) > len(longest):
            longest = word

    # Step 6: Return the Longest Word
    return longest

