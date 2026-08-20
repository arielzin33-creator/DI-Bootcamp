import os

import streamlit as st
from dotenv import load_dotenv

import rag_agent

load_dotenv()

# ---------------------- API keys & LangSmith tracing ----------------------
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY")

# Only turn tracing on if a LangSmith key is actually present — setting these flags
# unconditionally would make every run try (and fail) to reach LangSmith with no key.
if LANGCHAIN_API_KEY:
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_ENDPOINT"] = os.getenv(
        "LANGCHAIN_ENDPOINT", "https://api.smith.langchain.com"
    )
    os.environ.setdefault("LANGCHAIN_PROJECT", "agentic-rag-app")

# ---------------------- Page setup ----------------------
st.set_page_config(page_title="Agentic RAG", page_icon="🔎")
st.title("🔎 Agentic RAG")
st.caption(
    "Ask a question — the agent decides whether to search its knowledge base, the web via "
    "Tavily, or both, and cites its sources."
)

with st.expander("Environment status", expanded=False):
    st.write(f"GROQ_API_KEY: {'✅ set' if GROQ_API_KEY else '❌ missing (required)'}")
    st.write(f"TAVILY_API_KEY: {'✅ set' if TAVILY_API_KEY else '❌ missing (required)'}")
    st.write(f"GOOGLE_API_KEY: {'✅ set' if GOOGLE_API_KEY else '➖ not set (optional)'}")
    st.write(
        f"LANGCHAIN_API_KEY: {'✅ set — tracing enabled' if LANGCHAIN_API_KEY else '➖ not set — tracing disabled'}"
    )
    if not (GROQ_API_KEY and TAVILY_API_KEY):
        st.warning(
            "GROQ_API_KEY and TAVILY_API_KEY are both required for real answers. "
            "Copy .env.example to .env and add your keys — the app will still load "
            "without them, but every query will return a clear error instead of an answer."
        )

# ---------------------- Query box ----------------------
query = st.text_input("Ask a question:", placeholder="e.g. What is agentic RAG?")
submitted = st.button("Submit")

if submitted:
    if not query.strip():
        st.info("Enter a question first.")
    else:
        with st.spinner("Thinking..."):
            result = rag_agent.run_agentic_rag(query)

        if result["error"]:
            st.error(result["error"])
        else:
            st.markdown("### Answer")
            st.write(result["answer"])

            if result["sources"]:
                st.markdown("### Sources consulted")
                for s in result["sources"]:
                    st.write(f"- {s}")
            else:
                st.caption("No tools were called for this answer.")

# ---------------------- Notebook viewer ----------------------
st.divider()
with st.expander("View the agentic_rag.ipynb notebook source"):
    notebook_path = os.path.join(os.path.dirname(__file__), "agentic_rag.ipynb")
    try:
        with open(notebook_path, "r", encoding="utf-8") as f:
            notebook_text = f.read()
        st.code(notebook_text, language="json")
    except FileNotFoundError:
        st.caption(
            "agentic_rag.ipynb not found next to app.py — this panel just displays its raw "
            "text for reference, it doesn't execute the notebook."
        )
