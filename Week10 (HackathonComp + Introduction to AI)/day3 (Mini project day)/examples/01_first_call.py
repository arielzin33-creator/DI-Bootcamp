import time
import ollama
from rich.console import Console
from rich.panel import Panel

console = Console()

MODEL = "phi4-mini"
PROMPT = "Explain what a neural network is in exactly 3 sentences, suitable for a 12-year-old."

console.print(f"\n[bold]Model:[/bold] {MODEL}")
console.print(Panel(PROMPT, title="Prompt", border_style="blue"))

start = time.time()

response = ollama.chat(
    model=MODEL,
    messages=[
        {"role": "user", "content": PROMPT}
    ]
)

elapsed = time.time() - start

answer = response.message.content
tokens = response.eval_count  # tokens generated

console.print(Panel(answer, title="Response", border_style="green"))
console.print(
    f"\n[dim]Time: {elapsed:.2f}s | Tokens generated: {tokens} | "
    f"Speed: {tokens / elapsed:.1f} tok/s[/dim]\n"
)
