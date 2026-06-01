# ============================================================
# Exercise 1 — Insert item at defined index
# ============================================================

my_list = [10, 20, 30, 40, 50]
item     = 99
index    = 2

my_list.insert(index, item)
print("Ex 1:", my_list)
# [10, 20, 99, 30, 40, 50]


# ============================================================
# Exercise 2 — Count spaces in a string
# ============================================================

def count_spaces(s):
    count = 0
    for char in s:
        if char == ' ':
            count += 1
    return count

print("Ex 2:", count_spaces("hello world, how are you"))
# 4


# ============================================================
# Exercise 3 — Count upper and lower case letters
# ============================================================

def count_cases(s):
    upper = 0
    lower = 0
    for char in s:
        if char.isupper():
            upper += 1
        elif char.islower():
            lower += 1
    return upper, lower

upper, lower = count_cases("Hello World! How Are You?")
print(f"Ex 3: Upper: {upper}, Lower: {lower}")
# Upper: 4, Lower: 14


# ============================================================
# Exercise 4 — Sum of a list without built-in sum()
# ============================================================

def my_sum(lst):
    total = 0
    for num in lst:
        total += num
    return total

print("Ex 4:", my_sum([1, 5, 4, 2]))
# 12


# ============================================================
# Exercise 5 — Find max number in a list
# ============================================================

def find_max(lst):
    maximum = lst[0]
    for num in lst:
        if num > maximum:
            maximum = num
    return maximum

print("Ex 5:", find_max([0, 1, 3, 50]))
# 50


# ============================================================
# Exercise 6 — Factorial of a number
# ============================================================

def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

print("Ex 6:", factorial(4))
# 24


# ============================================================
# Exercise 7 — Count element in a list (no .count())
# ============================================================

def list_count(lst, element):
    count = 0
    for item in lst:
        if item == element:
            count += 1
    return count

print("Ex 7:", list_count(['a', 'a', 't', 'o'], 'a'))
# 2


# ============================================================
# Exercise 8 — L2-norm (sqrt of sum of squares)
# ============================================================

def norm(lst):
    sum_of_squares = 0
    for num in lst:
        sum_of_squares += num ** 2
    return sum_of_squares ** 0.5

print("Ex 8:", norm([1, 2, 2]))
# 3.0


# ============================================================
# Exercise 9 — Check if list is monotonic
# ============================================================

def is_mono(lst):
    ascending  = all(lst[i] <= lst[i+1] for i in range(len(lst) - 1))
    descending = all(lst[i] >= lst[i+1] for i in range(len(lst) - 1))
    return ascending or descending

print("Ex 9:", is_mono([7, 6, 5, 5, 2, 0]))   # True
print("Ex 9:", is_mono([2, 3, 3, 3]))          # True
print("Ex 9:", is_mono([1, 2, 0, 4]))          # False


# ============================================================
# Exercise 10 — Print longest word in a list
# ============================================================

def longest_word(lst):
    longest = ""
    for word in lst:
        if len(word) > len(longest):
            longest = word
    print(longest)

longest_word(["sky", "elephant", "river", "sun"])
# elephant


# ============================================================
# Exercise 11 — Separate integers and strings
# ============================================================

def separate_types(lst):
    integers = []
    strings  = []
    for item in lst:
        if isinstance(item, int):
            integers.append(item)
        elif isinstance(item, str):
            strings.append(item)
    return integers, strings

mixed = [1, "hello", 2, "world", 3, "python", 4]
integers, strings = separate_types(mixed)
print("Ex 11 — Integers:", integers)
print("Ex 11 — Strings: ", strings)
# Integers: [1, 2, 3, 4]
# Strings:  ['hello', 'world', 'python']


# ============================================================
# Exercise 12 — Check if a string is a palindrome
# ============================================================

def is_palindrome(s):
    s = s.lower()
    return s == s[::-1]

print("Ex 12:", is_palindrome('radar'))   # True
print("Ex 12:", is_palindrome('John'))    # False


# ============================================================
# Exercise 13 — Count words with length > k
# ============================================================

def sum_over_k(sentence, k):
    words = sentence.split()
    count = 0
    for word in words:
        if len(word) > k:
            count += 1
    return count

sentence = 'Do or do not there is no try'
print("Ex 13:", sum_over_k(sentence, 2))
# 3  ('not', 'there', 'try')


# ============================================================
# Exercise 14 — Average value in a dictionary
# ============================================================

def dict_avg(d):
    total = 0
    for value in d.values():
        total += value
    return total / len(d)

print("Ex 14:", dict_avg({'a': 1, 'b': 2, 'c': 8, 'd': 1}))
# 3.0


# ============================================================
# Exercise 15 — Common divisors of 2 numbers
# ============================================================

def common_div(a, b):
    divisors = []
    smaller  = min(a, b)
    for i in range(2, smaller + 1):
        if a % i == 0 and b % i == 0:
            divisors.append(i)
    return divisors

print("Ex 15:", common_div(10, 20))
# [2, 5, 10]


# ============================================================
# Exercise 16 — Test if a number is prime
# ============================================================

def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

print("Ex 16:", is_prime(11))    # True
print("Ex 16:", is_prime(12))    # False


# ============================================================
# Exercise 17 — Print elements where index AND value are even
# ============================================================

def weird_print(lst):
    result = []
    for i in range(len(lst)):
        if i % 2 == 0 and lst[i] % 2 == 0:
            result.append(lst[i])
    print(result)

weird_print([1, 2, 2, 3, 4, 5])
# [2, 4]


# ============================================================
# Exercise 18 — Count types from keyword arguments
# ============================================================

def type_count(**kwargs):
    counts = {}
    for value in kwargs.values():
        type_name = type(value).__name__
        counts[type_name] = counts.get(type_name, 0) + 1
    result = ", ".join(f"{t}: {c}" for t, c in counts.items())
    print(result)

type_count(a=1, b='string', c=1.0, d=True, e=False)
# bool: 2, int: 1, str: 1, float: 1
# Note: Python treats True/False as bool, not int, in type()


# ============================================================
# Exercise 19 — Custom split() method
# ============================================================

def my_split(s, sep=None):
    words   = []
    current = ""

    for char in s:
        # Default: split on any whitespace
        if sep is None:
            if char == ' ' or char == '\t' or char == '\n':
                if current:             # ignore multiple spaces
                    words.append(current)
                    current = ""
            else:
                current += char
        # Custom separator
        else:
            if char == sep:
                words.append(current)
                current = ""
            else:
                current += char

    if current:
        words.append(current)

    return words

print("Ex 19:", my_split("hello world how are you"))
# ['hello', 'world', 'how', 'are', 'you']

print("Ex 19:", my_split("a,b,c,d", ','))
# ['a', 'b', 'c', 'd']


# ============================================================
# Exercise 20 — Convert string to password format
# ============================================================

def to_password(s):
    return '*' * len(s)

print("Ex 20:", to_password("mypassword"))
# **********