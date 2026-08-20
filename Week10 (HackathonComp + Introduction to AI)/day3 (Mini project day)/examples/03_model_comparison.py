import time
import ollama
from rich.console import Console
from rich.table import Table
from rich import box

console = Console()

# The three models we installed in verify_setup.py
MODELS = ["phi4-mini", "mistral", "qwen3:8b"]

# Two short tasks — same question, three different models
PROMPTS = {
    "General Knowledge": "Explain photosynthesis in one sentence.",
    "Code Generation":   "Write a Python function called is_even(n) that returns True if n is even. Add a one-line docstring.",
}


def query_model(model, prompt):
    """Ask a model one question and return the answer plus how long it took."""
    start = time.time()
    response = ollama.chat(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0.2, "num_predict": 150}
    )
    elapsed = time.time() - start
    return response.message.content.strip(), elapsed


# Run each task and print a comparison table
for prompt_name, prompt_text in PROMPTS.items():
    console.print(f"\n[bold cyan]{'='*60}[/bold cyan]")
    console.print(f"[bold]Task:[/bold] {prompt_name}")
    console.print(f"[dim]{prompt_text}[/dim]\n")

    table = Table(box=box.ROUNDED, show_lines=True)
    table.add_column("Model",    style="bold yellow", width=18)
    table.add_column("Response", width=60)
    table.add_column("Time (s)", justify="right", width=9)

    for model in MODELS:
        console.print(f"  [dim]Asking {model}...[/dim]")
        text, elapsed = query_model(model, prompt_text)
        preview = text[:250].replace("\n", " ") + ("..." if len(text) > 250 else "")
        table.add_row(model, preview, f"{elapsed:.2f}")

    console.print(table)

console.print("\n[bold green]Done! Notice how each model phrases its answer differently.[/bold green]\n")
