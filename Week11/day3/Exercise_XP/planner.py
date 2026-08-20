"""
planner.py -- a rule-based planner: if the question mentions a known KB
topic, prefer the retriever; otherwise fall back to Wikipedia.
"""

from kb import KB_TOPIC_KEYWORDS


def plan_query(question: str) -> dict:
    """
    Return a plan dict: {"action": "kb" | "wikipedia", "matched_topics": [...], "reason": str}.

    Keyword matching is deliberately simple substring matching, not fuzzy
    or semantic -- "rule-based planner" per the exercise means exactly
    that: an explicit, readable rule ("does the question contain any of
    these known words"), not a second retrieval step in disguise.
    """
    question_lower = question.lower()

    matched_topics = [
        topic
        for topic, keywords in KB_TOPIC_KEYWORDS.items()
        if any(keyword in question_lower for keyword in keywords)
    ]

    if matched_topics:
        return {
            "action": "kb",
            "matched_topics": matched_topics,
            "reason": f"Question mentions known KB topic(s): {', '.join(matched_topics)}.",
        }

    return {
        "action": "wikipedia",
        "matched_topics": [],
        "reason": "No known KB topic matched the question; falling back to Wikipedia.",
    }
