users = []

for i in range(5):
    print(f"\nEntry {i + 1}:")
    name  = input("  Name  : ").strip()
    age   = input("  Age   : ").strip()
    score = input("  Score : ").strip()
    users.append((name, age, score))

users.sort(key=lambda user: (user[0], user[1], user[2]))

print("\nSorted list:")
print(users)