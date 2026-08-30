import ollama
from rich.console import Console
from rich.table import Table

console = Console()

MODEL = "phi4-mini"
PROMPT = "Write a one-sentence creative opening line for a science fiction story."

temperatures = [0.0, 0.7, 1.5]
runs_per_temp = 3

console.print(f"\n[bold cyan]Parameter Exploration — Model: {MODEL}[/bold cyan]")
console.print(f"[dim]Prompt: {PROMPT}[/dim]\n")

for temp in temperatures:
    table = Table(
        title=f"Temperature = {temp}",
        show_header=True,
        header_style="bold magenta"
    )
    table.add_column("Run", width=5)
    table.add_column("Output", no_wrap=False)

    for i in range(runs_per_temp):
        response = ollama.chat(
            model=MODEL,
            messages=[{"role": "user", "content": PROMPT}],
            options={
                "temperature": temp,
                "num_predict": 60,
            }
        )
        table.add_row(str(i + 1), response.message.content.strip())

    console.print(table)
    console.print()

# Demonstrate max_tokens effect
console.print("[bold]Max Tokens Demonstration[/bold]")
console.print("[dim]Same prompt, different max token limits[/dim]\n")

for max_t in [10, 30, 100]:
    response = ollama.chat(
        model=MODEL,
        messages=[{"role": "user", "content": "Describe the water cycle."}],
        options={"temperature": 0.7, "num_predict": max_t}
    )
    console.print(f"[yellow]max_tokens={max_t}:[/yellow] {response.message.content.strip()}\n")
