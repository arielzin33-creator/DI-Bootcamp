# ==============================================================================
# Exercise 2: Giphy API #1
# ==============================================================================

import requests

API_KEY  = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My"
BASE_URL = "https://api.giphy.com/v1/gifs/search"
QUERY    = "hilarious"
RATING   = "g"
LIMIT    = 10


def fetch_gifs():
    url = f"{BASE_URL}?q={QUERY}&rating={RATING}&api_key={API_KEY}&limit={LIMIT}"
    response = requests.get(url)

    if response.status_code != 200:
        print(f"Error: received status code {response.status_code}")
        return

    data = response.json()
    gifs = data["data"]

    filtered = [
        gif for gif in gifs
        if int(gif["images"]["original"]["height"]) > 100
    ]

    print(f"Total gifs returned      : {len(gifs)}")
    print(f"Gifs with height > 100   : {len(filtered)}")
    print(f"\nFirst {LIMIT} filtered gifs:")
    for i, gif in enumerate(filtered[:LIMIT], 1):
        title  = gif.get("title", "No title")
        height = gif["images"]["original"]["height"]
        url    = gif["images"]["original"]["url"]
        print(f"  {i:>2}. [{height}px] {title}")
        print(f"      {url}")

    return filtered


fetch_gifs()