"""Day 2 class setup check - requires only `requests`.
Run BEFORE class: python verify_setup.py
"""
import sys

try:
    import requests
except ImportError:
    print("[X] missing package - run: pip install requests")
    sys.exit(1)

BASE = "http://localhost:11434"
CLASS_MODEL = "qwen3:0.6b"          # everyone
STRETCH_MODEL = "mistral:7b"        # 16GB+ laptops (optional)

print("\nChecking Ollama server...")
try:
    r = requests.get(f"{BASE}/api/tags", timeout=5)
    r.raise_for_status()
except Exception as e:
    print(f"[X] Cannot reach Ollama at {BASE}")
    print("    Is it installed?  ollama --version")
    print("    Is it running?    it usually runs as a service; try: ollama serve")
    sys.exit(1)

models = [m["name"] for m in r.json().get("models", [])]
print(f"[OK] Ollama is running. Installed models: {models or 'none yet'}")

def check(name, required):
    hit = any(name in m for m in models)
    tag = "[OK]" if hit else ("[X]" if required else "[--]")
    note = "" if hit else f"  ->  ollama pull {name}"
    print(f"{tag} {name}{note}")
    return hit or not required

ok = check(CLASS_MODEL, required=True)
check(STRETCH_MODEL, required=False)

if ok:
    print("\nAll set for class. See you at minute one.\n")
else:
    print("\nPull the missing class model before class (400 MB, 2 minutes).\n")
    sys.exit(1)
