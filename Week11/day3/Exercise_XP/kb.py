"""
kb.py -- the in-memory knowledge base: 8 short Document objects, each with
a `source` field, plus the topic keyword map the rule-based planner uses
to decide "this question is about something in the KB."

Written against `langchain` 1.3.14 / `langchain-community` 0.4.2, checked
directly rather than assumed -- see README.md for the version notes,
including a real deprecation warning from `langchain-community` worth
knowing about before building anything new against it.
"""

from langchain_core.documents import Document

KB_DOCS = [
    Document(
        page_content=(
            "Python is a high-level, general-purpose programming language created by "
            "Guido van Rossum and first released in 1991. It emphasizes code readability "
            "through significant indentation and supports multiple programming paradigms, "
            "including procedural, object-oriented, and functional programming."
        ),
        metadata={"source": "kb:doc1", "topic": "python"},
    ),
    Document(
        page_content=(
            "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in "
            "Paris, France. It was designed by Gustave Eiffel's engineering company and "
            "completed in 1889 as the entrance arch for the 1889 World's Fair. At 330 "
            "metres tall, it was the world's tallest man-made structure for 41 years."
        ),
        metadata={"source": "kb:doc2", "topic": "eiffel tower"},
    ),
    Document(
        page_content=(
            "Photosynthesis is the process by which plants, algae, and some bacteria "
            "convert light energy into chemical energy, storing it in glucose molecules. "
            "It occurs primarily in chloroplasts and produces oxygen as a byproduct, "
            "which is essential for most life on Earth."
        ),
        metadata={"source": "kb:doc3", "topic": "photosynthesis"},
    ),
    Document(
        page_content=(
            "The Great Wall of China is a series of fortifications built across the "
            "historical northern borders of China, primarily to protect against nomadic "
            "invasions. Construction began as early as the 7th century BC, with the most "
            "famous sections built during the Ming dynasty (1368-1644)."
        ),
        metadata={"source": "kb:doc4", "topic": "great wall of china"},
    ),
    Document(
        page_content=(
            "Bitcoin is a decentralized digital currency introduced in a 2008 whitepaper "
            "by the pseudonymous Satoshi Nakamoto. Transactions are recorded on a public "
            "distributed ledger called a blockchain, secured by a proof-of-work consensus "
            "mechanism, without requiring a central bank or single administrator."
        ),
        metadata={"source": "kb:doc5", "topic": "bitcoin"},
    ),
    Document(
        page_content=(
            "Mount Everest, known in Nepali as Sagarmatha, is Earth's highest mountain "
            "above sea level, located in the Mahalangur Himal sub-range of the Himalayas. "
            "Its peak sits at 8,849 metres. The international border between Nepal and "
            "China (Tibet) runs across its summit point."
        ),
        metadata={"source": "kb:doc6", "topic": "mount everest"},
    ),
    Document(
        page_content=(
            "William Shakespeare (1564-1616) was an English playwright, poet, and actor, "
            "widely regarded as the greatest writer in the English language. His works "
            "include tragedies such as Hamlet and Macbeth, comedies such as A Midsummer "
            "Night's Dream, and 154 sonnets."
        ),
        metadata={"source": "kb:doc7", "topic": "shakespeare"},
    ),
    Document(
        page_content=(
            "DNA (deoxyribonucleic acid) is a molecule composed of two polynucleotide "
            "chains that coil around each other to form a double helix, carrying the "
            "genetic instructions for the development, functioning, growth, and "
            "reproduction of all known organisms."
        ),
        metadata={"source": "kb:doc8", "topic": "dna"},
    ),
]

# One entry per KB doc, mapping a short topic key to the keywords that
# should trigger the planner to prefer the retriever over Wikipedia. Kept
# separate from KB_DOCS' own `topic` metadata field (rather than deriving
# keywords automatically from doc text) so the match rules are easy to
# read and tune independently of the document content itself.
KB_TOPIC_KEYWORDS: dict[str, list[str]] = {
    "python": ["python"],
    "eiffel tower": ["eiffel", "eiffel tower"],
    "photosynthesis": ["photosynthesis", "chlorophyll"],
    "great wall of china": ["great wall"],
    "bitcoin": ["bitcoin", "cryptocurrency", "blockchain"],
    "mount everest": ["everest", "mount everest", "sagarmatha"],
    "shakespeare": ["shakespeare", "hamlet", "macbeth"],
    "dna": ["dna", "deoxyribonucleic"],
}
