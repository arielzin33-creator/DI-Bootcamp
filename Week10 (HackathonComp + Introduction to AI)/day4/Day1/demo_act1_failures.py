"""
demo_act1_failures.py — Day 1, Act 1: Three things your LLM can't do

Run this BEFORE building the MCP server.
Let each response land. Let the silence speak.

Usage:
    python demo_act1_failures.py
"""

import ollama
from rich.console import Console
from rich.panel import Panel

console = Console()

MODEL = "mistral:7b" 
# "phi4-mini"

questions = [
    {
        "label": "1 — Filesystem",
        "question": "What is written in the file notes.txt in my current directory?",
        "expected": "LLM says it has no access to the filesystem.",
    },
    {
        "label": "2 — Live web data",
        "question": "What is the weather in Tel Aviv right now? Give me the exact temperature.",
        "expected": "LLM hedges, gives a stale answer, or confidently hallucinates.",
    },
    {
        "label": "3 — Database",
        "question": "Show me all products in our workshop database. List names, categories, and prices.",
        "expected": "LLM refuses — or confidently hallucinates an entire database.",
    },
]

# console.print("\n[bold red]Act 1 — Three things your LLM cannot do[/bold red]\n")
# console.print("Watch what happens when we ask questions that need real data.\n")

for q in questions:
    console.print(Panel(
        f"[bold]{q['question']}[/bold]",
        title=f"[yellow]Question {q['label']}[/yellow]",
        border_style="yellow"
    ))

    response = ollama.chat(
        model=MODEL,
        messages=[
            {"role": "system", "content": "Answer in 2-3 sentences. Be direct and concise."},
            {"role": "user", "content": q["question"]},
        ],
        options={"num_predict": 75},
    )

    console.print(Panel(
        response.message.content,
        title="[red]LLM Response[/red]",
        border_style="red"
    ))
    console.print(f"[dim]({q['expected']})[/dim]\n")

console.print(Panel(
    "[bold]Three real problems. Same pattern every time.[/bold]\n\n"
    "The LLM doesn't have a bridge to the outside world.\n"
    "MCP is that bridge. Let's build it.",
    border_style="green",
    title="The setup"
))
