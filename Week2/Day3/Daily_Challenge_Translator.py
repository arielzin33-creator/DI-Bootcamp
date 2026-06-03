from googletrans import Translator

french_words = ["Bonjour", "Au revoir", "Bienvenue", "A bientôt"]

def translate_words(words, src="fr", dest="en"):
    translator = Translator()
    result = {}
    for word in words:
        translation = translator.translate(word, src=src, dest=dest)
        result[word] = translation.text
    return result

if __name__ == "__main__":
    translations = translate_words(french_words)
    print(translations)