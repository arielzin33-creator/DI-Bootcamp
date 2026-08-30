import ollama as _ollama
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from rich.console import Console
from rich.rule import Rule
from rich.panel import Panel

console = Console()

# ─── Demo 1: Raw ollama vs ChatOllama side-by-side ────────────────────────────

console.print(Rule("[bold cyan]Demo 1 — Raw ollama vs ChatOllama[/bold cyan]"))

PROMPT = "What is a neural network? Answer in one sentence."

raw_response = _ollama.chat(
    model="mistral",
    messages=[{"role": "user", "content": PROMPT}]
)
console.print(f"[yellow]Raw ollama:[/yellow]   {raw_response.message.content.strip()}")

llm = ChatOllama(model="mistral", temperature=0)
lc_response = llm.invoke([HumanMessage(content=PROMPT)])
console.print(f"[green]ChatOllama:[/green]    {lc_response.content.strip()}")

console.print("\n[dim]Same answer, same model — different interface.[/dim]\n")


# ─── Demo 2: Provider swap in one line ────────────────────────────────────────

console.print(Rule("[bold cyan]Demo 2 — Provider swap[/bold cyan]"))

# Change this one line to switch providers — everything else stays identical
llm_local = ChatOllama(model="mistral", temperature=0)
# from langchain_openai import ChatOpenAI
# llm_local = ChatOpenAI(model="gpt-4o-mini")   # ← works with OPENAI_API_KEY set

question = "Name three benefits of open-source software."

response_local = llm_local.invoke([HumanMessage(content=question)])
console.print(Panel(response_local.content.strip(), title="[green]Ollama (local)[/green]", border_style="green"))
console.print("[dim]To use OpenAI instead: uncomment the ChatOpenAI lines, set OPENAI_API_KEY, run: pip install langchain-openai[/dim]\n")


# ─── Demo 3: ChatPromptTemplate — reusable prompt structures ──────────────────

console.print(Rule("[bold cyan]Demo 3 — ChatPromptTemplate[/bold cyan]"))

llm = ChatOllama(model="phi4-mini", temperature=0.5)

template = ChatPromptTemplate.from_messages([
    ("system", "You are a {role}. Keep your answer under 40 words."),
    ("human", "{question}"),
])

chain = template | llm

configs = [
    {"role": "Python tutor",      "question": "What is a list?"},
    {"role": "chef",              "question": "What is a list?"},
    {"role": "military sergeant", "question": "What is a list?"},
]

for config in configs:
    result = chain.invoke(config)
    console.print(f"[bold yellow]{config['role']}:[/bold yellow] {result.content.strip()}\n")

console.print("[dim]Same question, same model — different system prompt via template variables.[/dim]\n")


# ─── Demo 4: Conversation memory with LangChain message objects ───────────────

console.print(Rule("[bold cyan]Demo 4 — Memory with typed message objects[/bold cyan]"))

console.print("[dim]Same pattern as 04_chat_app.py — using LangChain objects instead of dicts.[/dim]\n")

llm = ChatOllama(model="mistral", temperature=0.7)

history = [SystemMessage(content="You are a concise assistant. Keep every reply under 20 words.")]

conversation = [
    "My favourite programming language is Python.",
    "What is my favourite language?",
    "Why do people like that language?",
]

for user_text in conversation:
    history.append(HumanMessage(content=user_text))
    response = llm.invoke(history)
    history.append(AIMessage(content=response.content))
    console.print(f"[bold blue]User:[/bold blue]      {user_text}")
    console.print(f"[bold green]Assistant:[/bold green] {response.content.strip()}\n")

console.print(f"[dim]Total messages in context: {len(history)} (grows with each turn)[/dim]\n")
