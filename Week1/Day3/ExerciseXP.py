# Exercise 1: Converting Lists into Dictionaries
keys = ['Ten', 'Twenty', 'Thirty']
values = [10, 20, 30]

list_dict = dict(zip(keys, values))
print(list_dict)

#Exercise 2: Cinemax #2
family = {"rick": 43, 'beth': 13, 'morty': 5, 'summer': 8}
Total_cost = 0
for name, age in family.items():
    if age < 3:
        ticket_price = 0
        Total_cost += ticket_price
    elif age >= 3 and age < 12: 
        ticket_price = 10
        Total_cost += ticket_price
    else:
        ticket_price = 15 
        Total_cost += ticket_price                 
    print(f"{name}'s ticket price is {ticket_price}")
print(f"The total cost for the family is: {Total_cost}")

# Exercise 3: Zara
brand ={
    "name": 'Zara',
    "creation_date": 1975,
    "creator_name": "Amancio Ortega Gaona",
    "type_of_clothes": ["men", "women", "children", "home"],
    "international_competitors": ["Gap", "H&M", "Benetton"],
    "number_stores": 7000,
    "major_color": {
        "France": "blue",
        "Spain": "red",
        "US": ["pink", "green"]
    }
}

brand.update({"number_stores": 2})
print(f"Zara's types of clients are: {brand['type_of_clothes']}")
brand.update({"country_creation": ["spain"]})

if "international_competitors" in brand:
    brand["international_competitors"].append("Desigual")
del brand["creation_date"]
print(brand["international_competitors"][-1])
print(brand["major_color"]["US"])
print(len(brand))
print(brand.keys())


#Exercise 4: Disney Characters
users = ["Mickey", "Minnie", "Donald", "Ariel", "Pluto"]

users_index = { user : index 
               for index, user in 
               enumerate(users) }
print(users_index)

index_users = { index : user 
               for index, user in 
               enumerate(users) }
print(index_users)

sorted_users_index = { user : index 
                      for index, user in 
                      enumerate(sorted(users)) }
print(sorted_users_index)