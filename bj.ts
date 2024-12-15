// Types for minimal overhead
type Suit = 'H' | 'D' | 'C' | 'S';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

// Card interface with explicit suit and rank
interface Card {
  suit: Suit;
  rank: Rank;
}

// Bitwise flags for optimization
const enum ButtonFlags {
  Hit = 1 << 0,
  Stand = 1 << 1,
  DoubleDown = 1 << 2,
  Split = 1 << 3,
  Insurance = 1 << 4,
}

// Compact game state
interface GameState {
  playerHands: Card[][];
  dealerHand: Card[];
  balance: number;
  buttons: number;
  message: string;
  deck: Card[];
}

// Mapping for card values
const CARD_VALUES: Record<Rank, number> = {
  A: 11,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 10,
  Q: 10,
  K: 10,
};

// Card creation function
function createDeck(): Card[] {
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

// Ultra-fast shuffle (Fisher-Yates)
function shuffleDeck(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Highly optimized hand value calculation
function calculateHandValue(hand: Card[]): { value: number; isSoft: boolean } {
  let value = 0;
  let aceCount = 0;

  for (const card of hand) {
    if (card.rank === 'A') {
      aceCount++;
      value += 11;
    } else {
      value += CARD_VALUES[card.rank];
    }
  }

  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }

  return {
    value,
    isSoft: aceCount > 0 && value <= 21,
  };
}

// Card display function
function displayCard(card: Card): string {
  return `${card.rank}${card.suit}`;
}

// Display hand function
function displayHand(hand: Card[]): string {
  return hand.map(displayCard).join(' ');
}

// Optimized game initialization
function initializeGame(initialBalance = 1000): GameState {
  return {
    playerHands: [],
    dealerHand: [],
    balance: initialBalance,
    buttons: 0,
    message: 'Game ready',
    deck: shuffleDeck(createDeck()),
  };
}

// Fast bet placement with minimal branching
function placeBet(state: GameState, bet: number): GameState {
  if (bet > state.balance) {
    return { ...state, message: 'Insufficient balance' };
  }

  const deck = [...state.deck];
  const playerHand = [deck.pop()!, deck.pop()!];
  const dealerHand = [deck.pop()!, deck.pop()!];

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);
  const dealerUpCard = dealerHand[0];

  let buttons = ButtonFlags.Hit | ButtonFlags.Stand | ButtonFlags.DoubleDown;
  let message = 'Game in progress';
  let balance = state.balance - bet;

  // Blackjack checks
  if (playerValue.value === 21) {
    message = dealerValue.value === 21 ? 'Push - Both have Blackjack' : 'Blackjack! Player wins 1.5x bet';
    balance += dealerValue.value === 21 ? bet : bet * 2.5;
    buttons = 0;
  } else if (dealerValue.value === 21) {
    message = 'Dealer has Blackjack';
    buttons = dealerUpCard.rank === 'A' ? ButtonFlags.Insurance : 0;
  } else {
    // Additional button states
    if (playerHand[0].rank === playerHand[1].rank) buttons |= ButtonFlags.Split;
    if (dealerUpCard.rank === 'A') buttons |= ButtonFlags.Insurance;

    // Enhanced message with card display
    message += ` | Player: ${displayHand(playerHand)} | Dealer: ${displayCard(dealerUpCard)}`;
  }

  return {
    playerHands: [playerHand],
    dealerHand,
    balance,
    buttons,
    message,
    deck,
  };
}

// Rapid hit function
function hit(state: GameState, handIndex = 0): GameState {
  if (!(state.buttons & ButtonFlags.Hit)) {
    return { ...state, message: 'Hit not allowed' };
  }

  const deck = [...state.deck];
  const hands = [...state.playerHands];
  const hand = [...hands[handIndex]];

  hand.push(deck.pop()!);
  hands[handIndex] = hand;

  const handValue = calculateHandValue(hand);
  let buttons = state.buttons & ~ButtonFlags.DoubleDown;
  let balance = state.balance;
  let message = `Card added. Hand: ${displayHand(hand)}`;

  if (handValue.value > 21) {
    message = `Bust! Hand: ${displayHand(hand)}`;
    buttons = 0;
  }

  return {
    ...state,
    playerHands: hands,
    balance,
    buttons,
    message,
    deck,
  };
}

// Rapid stand function
function stand(state: GameState): GameState {
  if (!(state.buttons & ButtonFlags.Stand)) {
    return { ...state, message: 'Stand not allowed' };
  }

  const deck = [...state.deck];
  let dealerHand = [...state.dealerHand];
  let dealerValue = calculateHandValue(dealerHand);

  // Dealer logic
  while (dealerValue.value < 17 || (dealerValue.isSoft && dealerValue.value === 17)) {
    dealerHand.push(deck.pop()!);
    dealerValue = calculateHandValue(dealerHand);
  }

  // Calculate winnings
  let balance = state.balance;
  const results: string[] = state.playerHands.map((hand) => {
    const playerValue = calculateHandValue(hand);

    if (playerValue.value > 21) return 'Lose';
    if (dealerValue.value > 21) return 'Win';

    if (playerValue.value > dealerValue.value) return 'Win';
    if (playerValue.value < dealerValue.value) return 'Lose';
    return 'Push';
  });

  return {
    ...state,
    dealerHand,
    balance,
    buttons: 0,
    message: `Dealer Hand: ${displayHand(dealerHand)} | Results: ${results.join(', ')}`,
    deck,
  };
}

// Rapid double down
function doubleDown(state: GameState, handIndex = 0): GameState {
  if (!(state.buttons & ButtonFlags.DoubleDown)) {
    return { ...state, message: 'Double Down not allowed' };
  }

  const deck = [...state.deck];
  const hands = [...state.playerHands];
  const hand = [...hands[handIndex]];

  if (hand.length !== 2) {
    return { ...state, message: 'Invalid Double Down' };
  }

  hand.push(deck.pop()!);
  hands[handIndex] = hand;

  return stand({
    ...state,
    playerHands: hands,
    deck,
  });
}

// Rapid split
function split(state: GameState): GameState {
  if (!(state.buttons & ButtonFlags.Split)) {
    return { ...state, message: 'Split not allowed' };
  }

  const deck = [...state.deck];
  const hand = state.playerHands[0];

  if (hand.length !== 2 || hand[0].rank !== hand[1].rank) {
    return { ...state, message: 'Cannot split' };
  }

  const hands = [
    [hand[0], deck.pop()!],
    [hand[1], deck.pop()!],
  ];

  return {
    ...state,
    playerHands: hands,
    buttons: state.buttons & ~ButtonFlags.Split,
    message: 'Hand split',
  };
}

// Rapid insurance
function takeInsurance(state: GameState): GameState {
  if (!(state.buttons & ButtonFlags.Insurance)) {
    return { ...state, message: 'Insurance not available' };
  }

  const dealerValue = calculateHandValue(state.dealerHand);
  const insuranceBet = state.playerHands[0].length * 25;

  return {
    ...state,
    balance: dealerValue.value === 21 ? state.balance + insuranceBet * 2 : state.balance - insuranceBet,
    buttons: 0,
    message: dealerValue.value === 21 ? 'Insurance pays out' : 'Insurance lost',
  };
}

export { initializeGame, placeBet, hit, stand, doubleDown, split, takeInsurance, displayCard, displayHand };
export type { GameState };
