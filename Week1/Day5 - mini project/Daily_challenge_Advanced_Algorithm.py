import random

list_of_numbers = [random.randint(0, 10000) for _ in range(20000)]
target_number = 3728

# Use a dictionary to track numbers we've seen and their indices
seen = {}
pairs = set()  # use a set to avoid duplicate pairs

for i, num in enumerate(list_of_numbers):
    complement = target_number - num

    if complement in seen:
        # Order the pair so (smaller, larger) to avoid duplicates like (1000,2728) and (2728,1000)
        pair = (min(num, complement), max(num, complement))
        pairs.add(pair)

    seen[num] = i  # record this number as seen

# Display results
print(f"Pairs that sum to {target_number}:\n")
for a, b in sorted(pairs):
    print(f"  {a} and {b} sums to the target_number {target_number}")

print(f"\nTotal unique pairs found: {len(pairs)}")