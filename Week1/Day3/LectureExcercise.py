# my_list = ['Rick', 'Sanchez']
# print("My last name is:", my_list[1])

# rick_dict = {
#     'first_name':'Rick',
#     'last_name':'Sanchez'
# }

# print("My last name is:", rick_dict['last_name'], rick_dict['first_name'])

sample_dict = { 
   "class":{ 
      "student":{ 
         "name":"Mike",
         "marks":{ 
            "physics":70,
            "history":80
         }
      }
   }
}

print("Mike's history marks are:", sample_dict['class']['student']['marks']['history'])

# a_dict = {'color': 'blue', 'fruit': 'apple', 'pet': 'dog'}
# print(a_dict.items())

# dict_items = dict.items()

# dict_items([('color', 'blue'), ('fruit', 'apple'), ('pet', 'dog')])

# for key, value in dict_items:
#     print(key, '->', value)


sample_dict = {
  "name": "Kelly",
  "age":25,
  "salary": 8000,
  "city": "New york"

}
#keys_to_remove = ["name", "salary"]

if "name" in sample_dict:
    del sample_dict["name"]
if "salary" in sample_dict:   
    del sample_dict["salary"]
print(sample_dict)