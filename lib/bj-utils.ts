type Suit = 'H' | 'D' | 'C' | 'S';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export type Card = {
  suit: Suit;
  rank: Rank;
};

export const enum ButtonFlags {
  Hit = 1 << 0,
  Stand = 1 << 1,
  DoubleDown = 1 << 2,
  Split = 1 << 3,
  Insurance = 1 << 4,
}

export function createDeck(): Card[] {
  const suits: Suit[] = ['H', 'D', 'C', 'S'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function calculateHandValue(hand: Card[]): {
  value: number;
  isSoft: boolean;
  alternativeValue?: number;
} {
  if (hand.length === 0) return { value: 0, isSoft: false };

  let value = 0;
  let aceCount = 0;

  // First pass: count non-Ace cards
  for (const card of hand) {
    if (card.rank === 'A') {
      aceCount++;
    } else {
      value += ['J', 'Q', 'K'].includes(card.rank) ? 10 : parseInt(card.rank);
    }
  }

  // Handle Aces
  let bestValue = value;
  let isSoft = false;

  // Start with all Aces as 1
  bestValue += aceCount;

  // Try converting Aces to 11 one by one
  for (let i = 0; i < aceCount; i++) {
    if (bestValue + 10 <= 21) {
      bestValue += 10;
      isSoft = true;
    }
  }

  // Determine if there's an alternative value
  let alternativeValue;
  if (aceCount > 0 && isSoft) {
    alternativeValue = value + aceCount;
  }

  return {
    value: bestValue,
    isSoft,
    ...(alternativeValue && { alternativeValue }),
  };
}

export function displayCard(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function displayHand(hand: Card[]): string {
  return hand.map(displayCard).join(' ');
}
