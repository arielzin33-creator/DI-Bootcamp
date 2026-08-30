import ollama
from rich.console import Console
from rich.table import Table

console = Console()

console.print("\n[bold cyan]Checking Ollama connection...[/bold cyan]")

try:
    models = ollama.list()
    model_names = [m.model for m in models.models]

    required = ["phi4-mini", "mistral", "qwen3:8b"]
    table = Table(title="Model Status")
    table.add_column("Model", style="cyan")
    table.add_column("Status", style="bold")

    all_ok = True
    for name in required:
        found = any(name in m for m in model_names)
        status = "[green]✓ Ready[/green]" if found else "[red]✗ Not found — run: ollama pull " + name + "[/red]"
        table.add_row(name, status)
        if not found:
            all_ok = False

    console.print(table)

    if all_ok:
        console.print("\n[bold green]All models ready. You are good to go![/bold green]\n")
    else:
        console.print("\n[bold red]Some models are missing. Run the ollama pull commands above.[/bold red]\n")

except Exception as e:
    console.print(f"\n[bold red]Cannot connect to Ollama: {e}[/bold red]")
    console.print("Make sure 'ollama serve' is running in another terminal.\n")
