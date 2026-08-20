import operator
from typing import Annotated, TypedDict

from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, ToolMessage, AIMessage, BaseMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from rich.console import Console
from rich.panel import Panel

console = Console()

# ─── Tools ────────────────────────────────────────────────────────────────────

@tool
def calculator(expression: str) -> str:
    """Evaluates a mathematical expression and returns the numeric result.
    Only use for arithmetic expressions like '2 + 3 * 4' or '(10 / 2) ** 2'.
    """
    try:
        allowed = set("0123456789 +-*/(). ")
        if not all(c in allowed for c in expression):
            return "Error: Only numeric arithmetic expressions are allowed."
        result = eval(expression, {"__builtins__": {}}, {})  # noqa: S307
        return str(result)
    except Exception as e:
        return f"Error evaluating expression: {e}"


@tool
def word_count(text: str) -> str:
    """Counts the number of words in a given text string."""
    count = len(text.split())
    return f"{count} words"


TOOLS = [calculator, word_count]
TOOL_MAP = {t.name: t for t in TOOLS}

# ─── LLM ──────────────────────────────────────────────────────────────────────

llm = ChatOllama(model="mistral", temperature=0)
llm_with_tools = llm.bind_tools(TOOLS)

# ─── State ────────────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]

# ─── Nodes ────────────────────────────────────────────────────────────────────

def agent_node(state: AgentState) -> dict:
    """LLM decides what to do next."""
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}


def tools_node(state: AgentState) -> dict:
    """Execute whatever tool the LLM requested."""
    last_message = state["messages"][-1]
    results = []
    for tool_call in last_message.tool_calls:
        tool_fn = TOOL_MAP[tool_call["name"]]
        result = tool_fn.invoke(tool_call["args"])
        results.append(ToolMessage(
            content=str(result),
            tool_call_id=tool_call["id"]
        ))
    return {"messages": results}

# ─── Routing ──────────────────────────────────────────────────────────────────

def should_continue(state: AgentState) -> str:
    """Route to tools if the LLM made a tool call, otherwise end."""
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return "end"

# ─── Build Graph ──────────────────────────────────────────────────────────────

graph = StateGraph(AgentState)
graph.add_node("agent", agent_node)
graph.add_node("tools", tools_node)
graph.set_entry_point("agent")
graph.add_conditional_edges("agent", should_continue, {"tools": "tools", "end": END})
graph.add_edge("tools", "agent")

app = graph.compile()

# ─── Run ──────────────────────────────────────────────────────────────────────

TASKS = [
    "What is (145 + 37) * 4?",
    "How many words are in this sentence: 'The quick brown fox jumps over the lazy dog'?",
    "If a rectangle has a perimeter of 48 and its length is twice its width, what are the dimensions? First calculate the width, then the length.",
]

for task in TASKS:
    console.print(Panel(task, title="Task", border_style="blue"))

    result = app.invoke({"messages": [HumanMessage(content=task)]})

    for msg in result["messages"]:
        if isinstance(msg, HumanMessage):
            console.print(f"[bold blue]User:[/bold blue] {msg.content}")
        elif isinstance(msg, AIMessage):
            if msg.tool_calls:
                for call in msg.tool_calls:
                    console.print(f"[bold yellow]→ Tool call:[/bold yellow] {call['name']}({call['args']})")
            else:
                console.print(f"[bold green]Answer:[/bold green] {msg.content}")
        elif isinstance(msg, ToolMessage):
            console.print(f"[bold magenta]← Tool result:[/bold magenta] {msg.content}")

    console.print()
