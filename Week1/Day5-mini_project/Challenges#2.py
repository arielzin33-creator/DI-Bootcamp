# Exercise 1 — Patterns
# Pattern 1 — Centered Triangle
rows = 3

for i in range(1, rows + 1):
    spaces = rows - i          # decreasing spaces: 2, 1, 0
    stars  = 2 * i - 1         # increasing odd stars: 1, 3, 5
    print(' ' * spaces + '*' * stars)
# Output:
#   *
#  ***
# *****

# Pattern 2 — Right-aligned Staircase
rows = 5

for i in range(1, rows + 1):
    spaces = rows - i          # decreasing spaces: 4, 3, 2, 1, 0
    stars  = i                 # increasing stars:  1, 2, 3, 4, 5
    print(' ' * spaces + '*' * stars)
# Output:
#     *
#    **
#   ***
#  ****
# *****

# Pattern 3 — Diamond Bottom / Hourglass Top
rows = 5

# Top half — left-aligned, growing
for i in range(1, rows + 1):
    print('*' * i)

# Bottom half — left-indented, shrinking
for i in range(rows, 0, -1):
    spaces = rows - i          # increasing spaces: 0, 1, 2, 3, 4
    print(' ' * spaces + '*' * i)
# Output:
# *
# **
# ***
# ****
# *****
# *****
#  ****
#   ***
#    **
#     *


# Exercise 2 — Code Analysis
my_list = [2, 24, 12, 354, 233]       # original list to be sorted
                                        # indices: 0   1   2    3    4

for i in range(len(my_list) - 1):      # outer loop: i goes 0,1,2,3
                                        # controls the "current position" to fill

    minimum = i                         # assume current position holds the minimum

    for j in range(i + 1, len(my_list)):  # inner loop: scan everything AFTER i
                                           # looking for a smaller value

        if(my_list[j] < my_list[minimum]): # found something smaller than current minimum
            minimum = j                     # update minimum to this new index

            if(minimum != i):               
                my_list[i], my_list[minimum] = my_list[minimum], my_list[i]
                                            # swap current position with found minimum

print(my_list)                          # print the final list