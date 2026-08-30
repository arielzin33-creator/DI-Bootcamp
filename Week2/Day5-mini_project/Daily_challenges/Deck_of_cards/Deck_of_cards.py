import random


class Card:
    SUITS = {
        "Hearts":   "♥️",
        "Diamonds": "♦️",
        "Clubs":    "♣️",
        "Spades":   "♠️",
    }
    VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

    def __init__(self, suit, value):
        self.suit  = suit
        self.value = value
        self.emoji = self.SUITS[suit]

    def __repr__(self):
        return f"{self.emoji}  {self.value} of {self.suit}"


class Deck:
    def __init__(self):
        self.cards = [
            Card(suit, value)
            for suit  in Card.SUITS
            for value in Card.VALUES
        ]

    def shuffle(self):
        self.cards = [
            Card(suit, value)
            for suit  in Card.SUITS
            for value in Card.VALUES
        ]
        random.shuffle(self.cards)
        print(f"🔀 Deck shuffled! {len(self.cards)} cards ready to play.\n")

    def deal(self):
        if not self.cards:
            raise Exception("🚫 No cards left in the deck!")
        card = self.cards.pop()
        print(f"🃏 Dealt: {card}")
        return card

    def __len__(self):
        return len(self.cards)

    def __repr__(self):
        return f"🂠  Deck — {len(self.cards)} cards remaining"


if __name__ == "__main__":
    deck = Deck()
    print(deck)

    deck.shuffle()

    print("Dealing 5 cards:")
    print("-" * 30)
    for _ in range(5):
        deck.deal()

    print(f"\n{deck}")