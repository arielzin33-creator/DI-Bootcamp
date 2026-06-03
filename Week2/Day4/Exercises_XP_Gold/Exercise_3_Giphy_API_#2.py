# ==============================================================================
# Exercise 3: Giphy API #2
# ==============================================================================

import requests

API_KEY       = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My"
SEARCH_URL    = "https://api.giphy.com/v1/gifs/search"
TRENDING_URL  = "https://api.giphy.com/v1/gifs/trending"


def display_gifs(gifs, label="Results"):
    print(f"\n── {label} ({len(gifs)} gifs) ───────────────────────")
    for i, gif in enumerate(gifs, 1):
        title = gif.get("title", "No title")
        url   = gif["images"]["original"]["url"]
        print(f"  {i:>2}. {title}")
        print(f"      {url}")


def fetch_trending():
    url      = f"{TRENDING_URL}?api_key={API_KEY}&limit=10&rating=g"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()["data"]
    return []


def search_gifs(term):
    url      = f"{SEARCH_URL}?q={term}&api_key={API_KEY}&limit=10&rating=g"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()["data"]
    return []


def main_giphy():
    term = input("Enter a search term or phrase: ").strip()

    if not term:
        print("No term entered. Showing trending gifs instead.")
        gifs = fetch_trending()
        display_gifs(gifs, label="Trending Gifs")
        return

    gifs = search_gifs(term)

    if gifs:
        display_gifs(gifs, label=f'Results for "{term}"')
    else:
        print(f"\n  Could not find any gifs for '{term}'. Showing trending gifs instead.")
        trending = fetch_trending()
        display_gifs(trending, label="Trending Gifs")


main_giphy()