import re
import string
from collections import Counter


# ==============================================================================
# Part I & II: Text Class
# ==============================================================================

class Text:
    def __init__(self, text):
        self.text = text

    # ── Helpers ────────────────────────────────────────────────────────────────

    def _words(self):
        return self.text.lower().split()

    # ── Step 2: word_frequency ─────────────────────────────────────────────────

    def word_frequency(self, word):
        count = self._words().count(word.lower())
        if count == 0:
            return f"'{word}' was not found in the text."
        return count

    # ── Step 3: most_common_word ───────────────────────────────────────────────

    def most_common_word(self):
        words = self._words()
        if not words:
            return None
        frequency = {}
        for word in words:
            frequency[word] = frequency.get(word, 0) + 1
        return max(frequency, key=frequency.get)

    # ── Step 4: unique_words ───────────────────────────────────────────────────

    def unique_words(self):
        return list(set(self._words()))

    # ── Step 5: from_file ──────────────────────────────────────────────────────

    @classmethod
    def from_file(cls, file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return cls(content)

    def __repr__(self):
        preview = self.text[:50] + "..." if len(self.text) > 50 else self.text
        return f"Text('{preview}')"


# ==============================================================================
# Bonus: TextModification Class
# ==============================================================================

STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "from", "is", "it", "its", "was",
    "are", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may",
    "might", "shall", "can", "that", "this", "these", "those", "i",
    "you", "he", "she", "we", "they", "me", "him", "her", "us",
    "them", "my", "your", "his", "our", "their", "what", "which",
    "who", "not", "no", "so", "if", "as", "up", "out", "about",
    "into", "than", "then", "when", "there", "here", "just", "also"
}


class TextModification(Text):

    # ── Step 7: remove_punctuation ────────────────────────────────────────────

    def remove_punctuation(self):
        translator = str.maketrans("", "", string.punctuation)
        return self.text.translate(translator)

    # ── Step 8: remove_stop_words ─────────────────────────────────────────────

    def remove_stop_words(self):
        words = self.text.split()
        filtered = [w for w in words if w.lower() not in STOP_WORDS]
        return " ".join(filtered)

    # ── Step 9: remove_special_characters ────────────────────────────────────

    def remove_special_characters(self):
        return re.sub(r"[^a-zA-Z0-9\s]", "", self.text)


# ==============================================================================
# Demo
# ==============================================================================

if __name__ == "__main__":

    sample = (
        "To be or not to be, that is the question. "
        "Whether 'tis nobler in the mind to suffer "
        "the slings and arrows of outrageous fortune, "
        "or to take arms against a sea of troubles."
    )

    print("=" * 55)
    print("Part I: Text Analysis")
    print("=" * 55)

    t = Text(sample)

    print(f"\nText preview   : {repr(t)}")
    print(f"word_frequency('the')      : {t.word_frequency('the')}")
    print(f"word_frequency('python')   : {t.word_frequency('python')}")
    print(f"most_common_word()         : {t.most_common_word()}")
    unique = t.unique_words()
    print(f"unique_words() ({len(unique)} words) : {sorted(unique)[:8]} ...")

    print("\n" + "=" * 55)
    print("Part II: Text from File")
    print("=" * 55)

    with open("sample.txt", "w", encoding="utf-8") as f:
        f.write(sample)

    t_file = Text.from_file("sample.txt")
    print(f"\nLoaded from file : {repr(t_file)}")
    print(f"most_common_word(): {t_file.most_common_word()}")

    print("\n" + "=" * 55)
    print("Bonus: TextModification")
    print("=" * 55)

    tm = TextModification(sample)

    print(f"\nOriginal text:\n  {tm.text}")
    print(f"\nremove_punctuation():\n  {tm.remove_punctuation()}")
    print(f"\nremove_stop_words():\n  {tm.remove_stop_words()}")
    print(f"\nremove_special_characters():\n  {tm.remove_special_characters()}")