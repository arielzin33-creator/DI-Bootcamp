"""
retriever.py -- builds a FAISS retriever over KB_DOCS using FakeEmbeddings.

A real embedding model would place semantically similar documents near
each other in vector space; FakeEmbeddings deliberately does not -- it
generates random (but consistent per-text) vectors, so FAISS similarity
search over them is not meaningfully ranking by topic relevance at all.
That's fine here because topic *selection* is the rule-based planner's
job (see planner.py, which does real keyword matching against KB_DOCS'
topics before the retriever is ever called) -- the retriever's role is
just "fetch the top-k docs once we already know we want the KB," not "figure
out which KB docs are relevant." Confirmed directly: a query about Python
returned two visibly-unrelated docs sitting at the top of a FakeEmbeddings
FAISS index during testing, which is expected behavior for a stub
embedding, not a bug in this code.
"""

from langchain_community.vectorstores import FAISS
from langchain_core.embeddings import FakeEmbeddings
from langchain_core.vectorstores import VectorStoreRetriever

from kb import KB_DOCS

EMBEDDING_SIZE = 64


def build_kb_retriever(k: int = 3) -> VectorStoreRetriever:
    """Build a FAISS-backed retriever returning the top-k KB docs per query."""
    embeddings = FakeEmbeddings(size=EMBEDDING_SIZE)
    vector_store = FAISS.from_documents(KB_DOCS, embeddings)
    return vector_store.as_retriever(search_kwargs={"k": k})
