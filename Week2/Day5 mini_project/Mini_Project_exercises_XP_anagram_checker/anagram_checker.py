# ==============================================================================
# anagram_checker.py
# ==============================================================================

class AnagramChecker:
    def __init__(self, word_list_path="words.txt"):
        with open(word_list_path, "r", encoding="utf-8") as f:
            self.word_set = set(word.strip().lower() for word in f if word.strip())

    def is_valid_word(self, word):
        return word.strip().lower() in self.word_set

    def is_anagram(self, word1, word2):
        w1 = word1.strip().lower()
        w2 = word2.strip().lower()
        return (
            w1 != w2
            and len(w1) == len(w2)
            and sorted(w1) == sorted(w2)
        )

    def get_anagrams(self, word):
        word = word.strip().lower()
        return [w for w in self.word_set if self.is_anagram(word, w)]