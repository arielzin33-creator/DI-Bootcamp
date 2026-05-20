# Daily Challenge Solve The Matrix 
MATRIX_STR = '''
7ir
Tsi
h%x
i ?
sM# 
$a 
#t%'''

matrix = [list(row) for row in MATRIX_STR.strip().split('\n')]

num_cols = len(matrix[0])
num_rows = len(matrix)
message = ""

for col in range(num_cols):
    temp = ""
    in_gap = False                     

    for row in range(num_rows):
        char = matrix[row][col]
        if char.isalpha():
            if in_gap:                 
                temp += " "           
                in_gap = False
            temp += char
        else:
            if temp:                   
                in_gap = True
    message += temp

print(f"Secret message: {message}")

