import time
import ollama
from rich.console import Console
from rich.panel import Panel

console = Console()

MODEL = "qwen3:8b"

# Simpler problem — fewer steps = shorter thinking chain = faster on CPU
PROBLEM = """
A bookshelf has 3 shelves. The bottom shelf holds 6 books.
Each shelf above holds 2 fewer books than the shelf below it.
How many books are on the shelf in total?
Show your calculation.
"""

CORRECT_ANSWER = 12  # 6 + 4 + 2


def query_with_mode(thinking: bool) -> tuple[str, float]:
    system = "" if thinking else "/no_think"
    # Thinking OFF needs fewer tokens (direct answer).
    # Thinking ON needs more room to finish the <think> block AND write the answer.
    limit = 150 if not thinking else 600
    start = time.time()
    response = ollama.chat(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": PROBLEM.strip()}
        ],
        options={"temperature": 0.6, "num_predict": limit}
    )
    elapsed = time.time() - start

    # Ollama separates Qwen3 thinking into message.thinking; the final answer is in message.content
    thinking_text = getattr(response.message, "thinking", "") or ""
    answer_text   = response.message.content.strip()

    # Build display: show a thinking snippet (if present) + the answer
    if thinking_text:
        snippet = thinking_text[:200].replace("\n", " ").strip()
        display = f"[dim]<think> {snippet}... </think>[/dim]\n\n{answer_text}"
    else:
        display = answer_text or "[dim](no response)[/dim]"

    return display, elapsed


def check_correct(text: str, answer: int) -> str:
    return "[green]Contains correct answer[/green]" if str(answer) in text else "[red]Correct answer not found[/red]"


console.print(f"\n[bold cyan]Thinking Mode Comparison — {MODEL}[/bold cyan]")
console.print(Panel(PROBLEM.strip(), title="Problem", border_style="yellow"))
console.print(f"[dim]Correct answer: {CORRECT_ANSWER} books total[/dim]\n")

console.print("[bold]Running with Thinking OFF...[/bold]")
response_off, time_off = query_with_mode(thinking=False)

console.print("[bold]Running with Thinking ON...[/bold]")
response_on, time_on = query_with_mode(thinking=True)

console.print(Panel(
    f"{response_off}\n\n"
    f"[dim]Time: {time_off:.2f}s[/dim]\n"
    f"{check_correct(response_off, CORRECT_ANSWER)}",
    title="[red]Thinking OFF (/no_think)[/red]",
    border_style="red"
))

console.print(Panel(
    f"{response_on}\n\n"
    f"[dim]Time: {time_on:.2f}s[/dim]\n"
    f"{check_correct(response_on, CORRECT_ANSWER)}",
    title="[green]Thinking ON (default)[/green]",
    border_style="green"
))

console.print(
    f"\n[bold]Speed difference:[/bold] "
    f"Thinking ON was {time_on / time_off:.1f}× slower than Thinking OFF\n"
)
