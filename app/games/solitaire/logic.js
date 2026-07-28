export const SUITS = {
  HEARTS: { symbol: "♥️", color: "red", label: "Hearts" },
  DIAMONDS: { symbol: "♦️", color: "red", label: "Diamonds" },
  CLUBS: { symbol: "♣️", color: "black", label: "Clubs" },
  SPADES: { symbol: "♠️", color: "black", label: "Spades" },
};

export const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// Creates a basic standard deck of 52 cards
export function createDeck() {
  const deck = [];
  let id = 0;
  
  Object.keys(SUITS).forEach((suitKey) => {
    VALUES.forEach((value, index) => {
      deck.push({
        id: id++,
        suit: suitKey,
        symbol: SUITS[suitKey].symbol,
        color: SUITS[suitKey].color,
        value: value,
        rank: index + 1, // Ace = 1, Jack = 11, Queen = 12, King = 13
        isFaceUp: false,
      });
    });
  });
  
  return deck;
}

// Simple shuffle algorithm
export function shuffleDeck(deck) {
  const next = [...deck];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

// Rules for moving onto a column: must be alternating color and decreasing rank
export function canMoveToTableau(movingCard, targetCard) {
  if (!targetCard) {
    return movingCard.value === "K"; // Empty columns only accept Kings
  }
  return movingCard.color !== targetCard.color && movingCard.rank === targetCard.rank - 1;
}

// Rules for moving onto a foundation: must match suit and build upward from Ace
export function canMoveToFoundation(movingCard, topFoundationCard) {
  if (!topFoundationCard) {
    return movingCard.value === "A"; // Empty foundations only accept Aces
  }
  return movingCard.suit === topFoundationCard.suit && movingCard.rank === topFoundationCard.rank + 1;
}

// Helper to safely flip the last card in a column face up if it gets exposed
export function revealTopCard(column) {
  const nextCol = [...column];
  if (nextCol.length > 0 && !nextCol[nextCol.length - 1].isFaceUp) {
    nextCol[nextCol.length - 1] = { 
      ...nextCol[nextCol.length - 1], 
      isFaceUp: true 
    };
  }
  return nextCol;
}
