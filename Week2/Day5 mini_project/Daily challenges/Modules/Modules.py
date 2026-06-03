import requests
import time


def measure_load_time(url):
    if not url.startswith("http"):
        url = "https://" + url

    try:
        start    = time.perf_counter()
        response = requests.get(url, timeout=10)
        end      = time.perf_counter()

        elapsed  = end - start
        status   = response.status_code
        size_kb  = len(response.content) / 1024

        print(f"URL       : {url}")
        print(f"Status    : {status}")
        print(f"Size      : {size_kb:.2f} KB")
        print(f"Load time : {elapsed:.3f} seconds")
        print("-" * 45)

        return elapsed

    except requests.exceptions.Timeout:
        print(f"{url} -- Request timed out.")
        print("-" * 45)
    except requests.exceptions.ConnectionError:
        print(f"{url} -- Connection error.")
        print("-" * 45)
    except requests.exceptions.RequestException as e:
        print(f"{url} -- Error: {e}")
        print("-" * 45)


def benchmark_sites(sites):
    print("=" * 45)
    print("       Webpage Load Time Benchmark")
    print("=" * 45 + "\n")

    results = {}

    for site in sites:
        elapsed = measure_load_time(site)
        if elapsed is not None:
            results[site] = elapsed

    if results:
        print("\n" + "=" * 45)
        print("       Summary -- Fastest to Slowest")
        print("=" * 45)
        for site, t in sorted(results.items(), key=lambda x: x[1]):
            bar = "#" * int(t * 10)
            print(f"  {site:<25} {t:.3f}s  {bar}")
        print()

        fastest = min(results, key=results.get)
        slowest = max(results, key=results.get)
        print(f"  Fastest : {fastest} ({results[fastest]:.3f}s)")
        print(f"  Slowest : {slowest} ({results[slowest]:.3f}s)")
        print("=" * 45)


if __name__ == "__main__":
    sites = [
        "https://www.google.com",
        "https://www.ynet.co.il",
        "https://www.imdb.com",
        "https://www.github.com",
        "https://www.wikipedia.org",
        "https://www.amazon.com",
    ]

    benchmark_sites(sites)