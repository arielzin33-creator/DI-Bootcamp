# ==============================================================================
# Exercise 1: Random Sentence Generator
# ==============================================================================

import random
import sys
import json
import os


def get_words_from_file(file_path):
    try:
        with open(file_path, "r") as f:
            content = f.read()
        words = content.split()
        if not words:
            raise ValueError("The word file is empty.")
        return words
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)


def get_random_sentence(length, file_path="words.txt"):
    words = get_words_from_file(file_path)
    selected = [random.choice(words) for _ in range(length)]
    sentence = " ".join(selected).lower()
    return sentence


def main_sentence_generator():
    print("=" * 50)
    print("Welcome to the Random Sentence Generator!")
    print("This program generates a random sentence from a word list.")
    print("=" * 50)

    user_input = input("\nEnter the desired sentence length (2–20): ").strip()

    try:
        length = int(user_input)
    except ValueError:
        print("Error: Please enter a valid integer.")
        sys.exit(1)

    if not (2 <= length <= 20):
        print("Error: Length must be between 2 and 20 (inclusive).")
        sys.exit(1)

    sentence = get_random_sentence(length)
    print(f"\nGenerated sentence:\n  {sentence}")


# ==============================================================================
# Exercise 2: Working with JSON
# ==============================================================================

def main_json():
    print("\n" + "=" * 50)
    print("Exercise 2: Working with JSON")
    print("=" * 50)

    sample_json = """{
       "company":{
          "employee":{
             "name":"emma",
             "payable":{
                "salary":7000,
                "bonus":800
             }
          }
       }
    }"""

    data = json.loads(sample_json)

    salary = data["company"]["employee"]["payable"]["salary"]
    print(f"\nAccessed salary: {salary}")

    data["company"]["employee"]["birth_date"] = "1995-06-15"
    print(f"Added birth_date: {data['company']['employee']['birth_date']}")

    output_file = "employee.json"
    with open(output_file, "w") as f:
        json.dump(data, f, indent=4)

    print(f"\nModified JSON saved to '{output_file}'.")
    print("\nFile contents:")
    with open(output_file, "r") as f:
        print(f.read())


# ==============================================================================
# Entry Point
# ==============================================================================

if __name__ == "__main__":
    main_sentence_generator()
    main_json()