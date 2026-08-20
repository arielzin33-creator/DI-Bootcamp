import requests

def ask(prompt, model="qwen3:0.6b", system=None):
    r = requests.post(
        "http://localhost:11434/v1/chat/completions",
        json={
            "model": model,
            "messages":([{"role":"system", "content": system}] if system else []) + [{"role": "user", "content": prompt}]
        },
        timeout=120
    )
    return r.json()["choices"][0]["message"]["content"]

SYSTEM = """You are a senior tech writer.
Audience: a busy CFO who hates jargon.
Answer in exactly 3 bullets, each under 15 words.
Never invent statistics."""

# print(ask("What is the current weather in Tel Aviv?"))
print(ask("why should our company consider open-source AI models?", system=SYSTEM))