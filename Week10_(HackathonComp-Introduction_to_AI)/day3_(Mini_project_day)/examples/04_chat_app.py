import ollama
from rich.console import Console
from rich.panel import Panel
from rich.live import Live

console = Console()

MODEL = "mistral"

SYSTEM_PROMPT = """You are a friendly and knowledgeable Python tutor.
When asked a question, you always:
1. Give a direct, clear answer first.
2. Provide a short code example when relevant.
3. Suggest what the student might want to learn next.
Keep responses concise — no longer than 150 words unless the student explicitly asks for more detail."""


def chat():
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    console.print(Panel(
        f"[bold]Model:[/bold] {MODEL}\n"
        f"[bold]Persona:[/bold] Python Tutor\n\n"
        "[dim]Commands: type your message and press Enter\n"
        "Type [bold]'clear'[/bold] to reset the conversation\n"
        "Type [bold]'quit'[/bold] or [bold]'exit'[/bold] to end[/dim]",
        title="Chat App",
        border_style="cyan"
    ))

    while True:
        console.print("[bold blue]You:[/bold blue] ", end="")
        try:
            user_input = input().strip()
        except (KeyboardInterrupt, EOFError):
            console.print("\n[dim]Goodbye![/dim]")
            break

        if not user_input:
            continue

        if user_input.lower() in ("quit", "exit"):
            console.print("[dim]Goodbye![/dim]")
            break

        if user_input.lower() == "clear":
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            console.print("[yellow]Conversation cleared. Starting fresh.[/yellow]\n")
            continue

        messages.append({"role": "user", "content": user_input})

        console.print("[bold green]Assistant:[/bold green] ", end="")

        full_response = ""
        with Live(console=console, refresh_per_second=15) as live:
            stream = ollama.chat(
                model=MODEL,
                messages=messages,
                stream=True,
                options={"temperature": 0.7}
            )
            for chunk in stream:
                token = chunk.message.content
                full_response += token
                live.update(full_response)

        console.print()

        messages.append({"role": "assistant", "content": full_response})

        turn_count = sum(1 for m in messages if m["role"] == "user")
        console.print(f"[dim](Turn {turn_count} | {len(messages)} messages in context)[/dim]\n")


if __name__ == "__main__":
    chat()
