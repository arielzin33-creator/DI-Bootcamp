"""Core agentic RAG pipeline: a local-embedding knowledge-base retriever, a Tavily web-search
tool, and a Groq-backed tool-calling agent that grounds its answers with source citations.

This module is the "clean Python API" the Streamlit app (app.py) calls — it has no Streamlit
dependency itself, so it can also be imported and driven interactively from agentic_rag.ipynb.
"""

import os
import time
import traceback
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langchain_core.tools import create_retriever_tool

load_dotenv()

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
GROQ_MODEL = os.getenv("GROQ_MODEL_ID", "llama-3.1-8b-instant")
CHROMA_COLLECTION = "agentic_rag_demo"

SYSTEM_PROMPT = (
    "You are an agentic RAG assistant. You have two tools: a knowledge_base_search tool over "
    "a small internal knowledge base, and a web_search tool for anything not covered by it. "
    "Prefer the knowledge base first; fall back to web search only if the knowledge base doesn't "
    "have enough information. Always cite your sources inline — use [kb:N] for knowledge base "
    "snippets and [web:<url>] for web search results. Keep answers short (2-5 sentences). If you "
    "genuinely don't have enough evidence after checking your tools, say so explicitly and "
    "suggest a follow-up question rather than guessing."
)

# ---------------------- Demo Knowledge Base ----------------------
KB_DOCS = [
    Document(
        page_content=(
            "Agentic RAG combines retrieval-augmented generation with an agent that decides "
            "when and what to retrieve, rather than always retrieving on a fixed schedule."
        ),
        metadata={"source": "kb:1"},
    ),
    Document(
        page_content=(
            "LangGraph's create_react_agent (now langchain.agents.create_agent) builds a "
            "tool-calling agent loop: the model decides whether to call a tool, observes the "
            "result, and repeats until it produces a final answer."
        ),
        metadata={"source": "kb:2"},
    ),
    Document(
        page_content=(
            "Groq serves open models like Llama through a very low-latency inference API, "
            "often used for fast agent loops where tool-calling round trips add up quickly."
        ),
        metadata={"source": "kb:3"},
    ),
    Document(
        page_content=(
            "Tavily is a search API purpose-built for LLM agents, returning clean, structured "
            "web search results instead of raw HTML that would need separate parsing."
        ),
        metadata={"source": "kb:4"},
    ),
    Document(
        page_content=(
            "LangSmith provides tracing for LangChain and LangGraph applications, letting you "
            "inspect every step of an agent's reasoning and tool calls after the fact."
        ),
        metadata={"source": "kb:5"},
    ),
    Document(
        page_content=(
            "Chroma is a lightweight, embeddable vector database commonly used for "
            "small-to-medium local RAG knowledge bases, without needing a hosted vector DB."
        ),
        metadata={"source": "kb:6"},
    ),
]


class AgentInitError(RuntimeError):
    """Raised when the agent can't be built — usually a missing required API key."""


_agent_cache: Dict[str, Any] = {}


def _build_retriever_tool():
    from langchain_chroma import Chroma
    from langchain_huggingface import HuggingFaceEmbeddings

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    vectorstore = Chroma.from_documents(
        KB_DOCS, embedding=embeddings, collection_name=CHROMA_COLLECTION
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    return create_retriever_tool(
        retriever,
        "knowledge_base_search",
        "Search the internal knowledge base for information about agentic RAG, LangGraph, "
        "Groq, Tavily, LangSmith, and Chroma. Returns snippets tagged with their [kb:N] source.",
    )


def _build_search_tool():
    from langchain_tavily import TavilySearch

    if not os.getenv("TAVILY_API_KEY"):
        raise AgentInitError(
            "TAVILY_API_KEY is not set. Add it to your .env file — get a free key at "
            "https://tavily.com"
        )
    return TavilySearch(max_results=3)


def _build_llm():
    from langchain_groq import ChatGroq

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise AgentInitError(
            "GROQ_API_KEY is not set. Add it to your .env file — get a free key at "
            "https://console.groq.com/keys"
        )
    return ChatGroq(model=GROQ_MODEL, groq_api_key=api_key, temperature=0.2)


def get_agent():
    """Builds (and caches) the agentic RAG agent. Raises AgentInitError on missing keys.

    Key checks run before the (slow — loads a local embedding model) retriever build, so a
    missing-key error returns immediately instead of wasting several seconds first.
    """
    if "agent" in _agent_cache:
        return _agent_cache["agent"]

    from langchain.agents import create_agent

    llm = _build_llm()
    search_tool = _build_search_tool()
    retriever_tool = _build_retriever_tool()

    agent = create_agent(
        model=llm,
        tools=[retriever_tool, search_tool],
        system_prompt=SYSTEM_PROMPT,
    )
    _agent_cache["agent"] = agent
    return agent


def _extract_sources(messages: List[Any]) -> List[str]:
    """Pulls tool names + a short preview of what each tool call returned, so the UI can show
    which sources were actually consulted (not just trust the model's citation text)."""
    sources = []
    for m in messages:
        if isinstance(m, ToolMessage):
            tool_name = getattr(m, "name", "unknown_tool")
            content = str(m.content)[:150].replace("\n", " ")
            sources.append(f"{tool_name}: {content}...")
    return sources


def run_agentic_rag(query: str, timeout_seconds: int = 60) -> Dict[str, Any]:
    """Clean Python API for the Streamlit app: runs one query through the agent and returns a
    dict with `answer`, `sources`, and `error` (None on success). Never raises — all failure
    modes (missing keys, network errors, timeouts) are caught and returned as a message instead,
    so the Streamlit UI never crashes outright.
    """
    if not query or not query.strip():
        return {"answer": "", "sources": [], "error": "Please enter a question."}

    try:
        agent = get_agent()
    except AgentInitError as e:
        return {"answer": "", "sources": [], "error": str(e)}
    except Exception as e:
        return {"answer": "", "sources": [], "error": f"Failed to initialize agent: {e}"}

    start = time.time()
    try:
        result = agent.invoke(
            {"messages": [HumanMessage(content=query)]},
            config={"recursion_limit": 15},
        )
    except Exception as e:
        elapsed = time.time() - start
        if elapsed >= timeout_seconds:
            return {"answer": "", "sources": [], "error": "The request timed out. Please try again."}
        return {
            "answer": "",
            "sources": [],
            "error": f"Agent run failed: {e}",
            "traceback": traceback.format_exc(),
        }

    messages = result.get("messages", [])
    final_message = messages[-1] if messages else None
    answer = final_message.content if isinstance(final_message, AIMessage) else str(final_message)
    sources = _extract_sources(messages)

    return {"answer": answer, "sources": sources, "error": None}


if __name__ == "__main__":
    # Quick manual smoke test — requires real GROQ_API_KEY and TAVILY_API_KEY in .env.
    demo_query = "What is agentic RAG and how does LangGraph's agent loop relate to it?"
    print("Query:", demo_query)
    print(run_agentic_rag(demo_query))
