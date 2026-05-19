#Challenge 1: Letter Index Dictionary
user_input = input("Enter a word: ")

Letter_index = {}

for index, char in enumerate(user_input):
    if char in Letter_index:
        Letter_index[char].append(index)
    else:
        Letter_index[char] = [index]

print(Letter_index)


#Challenge 2: Affordable Items
items_purchase = {"Water": "$2", "Bread": "$3", "TV": "$1,000", "Fertilizer": "$20"}
wallet = "$1200"

replace_wallet = wallet.replace("$", "").replace(',', '')

replace_items = {item : price.replace("$", "").replace(',', '') 
                 for item, price in items_purchase.items()}

basket = []


for item, price in replace_items.items():
    if int(replace_wallet) >= int(price):
        basket.append(item)
        wallet = int(replace_wallet) - int(price)

  
if basket == []:
        print("Nothing")
else: 
    print(sorted(basket))
