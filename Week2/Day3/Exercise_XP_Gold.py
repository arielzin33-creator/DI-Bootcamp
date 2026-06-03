import re
import math
import random
import string
from datetime import date, datetime
import holidays


# ──────────────────────────────────────────────────────────────────────────────
# Exercise 1: Upcoming Holiday
# ──────────────────────────────────────────────────────────────────────────────

def upcoming_holiday(country="US"):
    today = date.today()
    print(f"Today's date: {today.strftime('%B %d, %Y')}")

    country_holidays = holidays.country_holidays(country, years=[today.year, today.year + 1])
    future_holidays = sorted(
        [(d, name) for d, name in country_holidays.items() if d >= today]
    )

    if not future_holidays:
        print("No upcoming holidays found.")
        return

    next_date, next_name = future_holidays[0]
    delta = next_date - today
    days_left = delta.days

    if days_left == 0:
        print(f"Today is {next_name}! 🎉")
    else:
        print(f"The next holiday is '{next_name}' on {next_date.strftime('%B %d, %Y')} — in {days_left} day(s).")


# ──────────────────────────────────────────────────────────────────────────────
# Exercise 2: How Old Are You On Each Planet?
# ──────────────────────────────────────────────────────────────────────────────

EARTH_YEAR_SECONDS = 31_557_600

PLANETS = {
    "Mercury": 0.2408467,
    "Venus":   0.61519726,
    "Earth":   1.0,
    "Mars":    1.8808158,
    "Jupiter": 11.862615,
    "Saturn":  29.447498,
    "Uranus":  84.016846,
    "Neptune": 164.79132,
}

def age_on_planets(age_seconds):
    print(f"\nAge in seconds: {age_seconds:,}")
    print("-" * 38)
    for planet, orbital_period in PLANETS.items():
        planet_years = age_seconds / (EARTH_YEAR_SECONDS * orbital_period)
        print(f"  {planet:<10}: {planet_years:.2f} years")


# ──────────────────────────────────────────────────────────────────────────────
# Exercise 3: Regular Expression #1 — Extract Numbers
# ──────────────────────────────────────────────────────────────────────────────

def return_numbers(s):
    digits = re.findall(r"\d", s)
    result = "".join(digits)
    print(f"Extracted numbers from '{s}': {result}")
    return result


# ──────────────────────────────────────────────────────────────────────────────
# Exercise 4: Regular Expression #2 — Validate Full Name
# ──────────────────────────────────────────────────────────────────────────────

def validate_full_name():
    name = input("Enter your full name (e.g. John Doe): ").strip()

    pattern = r"^[A-Z][a-z]+ [A-Z][a-z]+$"

    if not re.match(pattern, name):
        issues = []
        if not re.fullmatch(r"[A-Za-z ]+", name):
            issues.append("Name must contain only letters and one space.")
        if name.count(" ") != 1:
            issues.append("Name must contain exactly one space.")
        parts = name.split()
        if len(parts) == 2:
            if not parts[0][0].isupper():
                issues.append("First name must start with an uppercase letter.")
            if not parts[1][0].isupper():
                issues.append("Last name must start with an uppercase letter.")
        for issue in issues:
            print(f"  ✗ {issue}")
        print("Invalid name.")
    else:
        print(f"  ✓ '{name}' is a valid full name.")


# ──────────────────────────────────────────────────────────────────────────────
# Exercise 5: Password Generator
# ──────────────────────────────────────────────────────────────────────────────

SPECIAL_CHARS = "!@#$%^&*_-+=?"

def generate_password(length):
    guaranteed = [
        random.choice(string.digits),
        random.choice(string.ascii_lowercase),
        random.choice(string.ascii_uppercase),
        random.choice(SPECIAL_CHARS),
    ]
    all_chars = string.digits + string.ascii_lowercase + string.ascii_uppercase + SPECIAL_CHARS
    rest = [random.choice(all_chars) for _ in range(length - 4)]
    password_list = guaranteed + rest
    random.shuffle(password_list)
    return "".join(password_list)


def test_password(password, expected_length):
    has_digit   = bool(re.search(r"\d", password))
    has_lower   = bool(re.search(r"[a-z]", password))
    has_upper   = bool(re.search(r"[A-Z]", password))
    has_special = bool(re.search(r"[!@#$%^&*_\-+=?]", password))
    correct_len = len(password) == expected_length
    return all([has_digit, has_lower, has_upper, has_special, correct_len])


def password_generator():
    while True:
        try:
            length = int(input("Enter desired password length (6–30): "))
            if 6 <= length <= 30:
                break
            print("  Please enter a number between 6 and 30.")
        except ValueError:
            print("  Invalid input. Please enter a whole number.")

    password = generate_password(length)
    print(f"\n  Your password: {password}")
    print("  ⚠️  Keep this password in a safe place and do not share it!")


def run_password_tests():
    print("\n── Running 100 password generation tests ─────────────────")
    passed = 0
    failed = 0
    for _ in range(100):
        length = random.randint(6, 30)
        pw = generate_password(length)
        if test_password(pw, length):
            passed += 1
        else:
            failed += 1
            print(f"  FAIL: '{pw}' (length={length})")

    print(f"  Results: {passed}/100 passed, {failed}/100 failed.")
    if failed == 0:
        print("  ✓ All tests passed!")


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":

    print("=" * 50)
    print("EXERCISE 1: Upcoming Holiday")
    print("=" * 50)
    upcoming_holiday(country="US")

    print("\n" + "=" * 50)
    print("EXERCISE 2: Age on Planets")
    print("=" * 50)
    age_on_planets(1_000_000_000)

    print("\n" + "=" * 50)
    print("EXERCISE 3: Extract Numbers from String")
    print("=" * 50)
    return_numbers("k5k3q2g5z6x9bn")

    print("\n" + "=" * 50)
    print("EXERCISE 4: Validate Full Name")
    print("=" * 50)
    validate_full_name()

    print("\n" + "=" * 50)
    print("EXERCISE 5: Password Generator")
    print("=" * 50)
    run_password_tests()
    password_generator()