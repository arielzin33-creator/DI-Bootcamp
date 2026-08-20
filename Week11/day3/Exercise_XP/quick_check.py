"""
quick_check.py -- Exercise 5: run 3 sample questions (one KB-covered, one
external, one ambiguous/thin-evidence) and print the plan, sources, and
final answer for each.
"""

from answer import answer_question

SAMPLE_QUESTIONS = [
    "Tell me about the Python programming language.",
    "What is the capital of Japan?",
    "What is the flibbertigibbet quantum toaster theory?",
]


def run_quick_check(llm=None) -> None:
    for question in SAMPLE_QUESTIONS:
        result = answer_question(question, llm=llm)
        print(f"Q: {question}")
        print(f"  plan: {result['plan']}")
        print(f"  sources: {result['sources']}")
        print(f"  answer: {result['answer']}")
        print()


if __name__ == "__main__":
    run_quick_check()
