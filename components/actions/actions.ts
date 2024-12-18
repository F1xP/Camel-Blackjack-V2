'use server';

import { responseObject, ErrorCatcher } from '@/lib/utils';
import { db, DBTransactionType } from '@/drizzle/db';
import gameTable from '@/drizzle/schema/game';
import { ButtonFlags, calculateHandValue, createDeck, shuffleDeck } from '@/lib/bj-utils';
import { and, eq, sql } from 'drizzle-orm';
import { isAuthorized } from '@/lib/is-authorized';
import userTable from '@/drizzle/schema/user';
import { CustomError } from '@/lib/types';
import { deleteSessionTokenCookie, invalidateSession, validateSessionToken } from '@/lib/auth';

// Type definitions
type Card = {
  suit: 'H' | 'D' | 'C' | 'S';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
};

type GameState = {
  id: string;
  userId: string;
  playerHands: Card[][];
  dealerHand: Card[];
  buttonState: number;
  message: string;
  deck: Card[];
  balance: string;
  currentBet: string;
  isCompleted: boolean;
  currentHandIndex: number;
};

// Optimized balance update utility
const updateBalance = async (tx: DBTransactionType, userId: string, balanceChange: number): Promise<number> => {
  // Perform update and return the new balance in a single query
  const [result] = await tx
    .update(userTable)
    .set({
      balance: sql`CAST(${userTable.balance} AS NUMERIC) + ${balanceChange}`,
    })
    .where(eq(userTable.id, userId))
    .returning({ balance: userTable.balance });

  // Convert balance to number and check if it's less than zero
  const newBalance = parseFloat(result.balance);

  if (newBalance < 0.0) {
    // Rollback the transaction if balance would become negative
    throw new CustomError('Insufficient Funds');
  }

  return newBalance;
};

export const initializeGame = async (bet: number) => {
  try {
    const user = await isAuthorized('Default');

    const gameResult = await db.transaction(async (tx) => {
      // Update balance and validate in one step
      const newBalance = await updateBalance(tx, user.id, -bet);

      const deck = shuffleDeck(createDeck());
      const playerHand = [deck.pop()!, deck.pop()!];
      const dealerHand = [deck.pop()!, deck.pop()!];

      const playerValue = calculateHandValue(playerHand);
      const dealerValue = calculateHandValue(dealerHand);
      const dealerUpCard = dealerHand[0];

      let buttons = 0; // Start with no buttons enabled

      // Blackjack checks
      if (playerValue.value === 21) {
        const message = dealerValue.value === 21 ? 'Push - Both have Blackjack' : 'Blackjack! Player wins 1.5x bet';
        buttons = 0;

        const [game] = await tx
          .insert(gameTable)
          .values({
            userId: user.id,
            playerHands: [playerHand],
            dealerHand: dealerHand,
            buttonState: buttons,
            message,
            deck,
            currentBet: bet.toString(),
            isCompleted: true,
            balance: newBalance.toString(),
            currentHandIndex: 0,
          })
          .returning();

        return { game, newBalance };
      }

      // Insurance handling: Only allow insurance if dealer's upcard is Ace
      if (dealerUpCard.rank === 'A') {
        buttons = ButtonFlags.Insurance;
      } else {
        // Normal game start options
        buttons = ButtonFlags.Hit | ButtonFlags.Stand | ButtonFlags.DoubleDown;

        // Additional split option if first two cards are same rank
        if (playerHand[0].rank === playerHand[1].rank) {
          buttons |= ButtonFlags.Split;
        }
      }

      const message =
        dealerValue.value === 21
          ? dealerUpCard.rank === 'A'
            ? 'Insurance Available'
            : 'Dealer has Blackjack'
          : 'Game in progress';

      const [game] = await tx
        .insert(gameTable)
        .values({
          userId: user.id,
          playerHands: [playerHand],
          dealerHand: dealerHand,
          buttonState: buttons,
          message,
          deck,
          currentBet: bet.toString(),
          isCompleted: false,
          balance: newBalance.toString(),
          currentHandIndex: 0,
        })
        .returning();

      return { game, newBalance };
    });

    return responseObject({
      type: 'SUCCESS',
      message: 'Game initialized successfully.',
      showToast: true,
    });
  } catch (e) {
    console.error(e);
    return ErrorCatcher(e);
  }
};

export const hit = async () => {
  try {
    const user = await isAuthorized('Default');

    const [state] = await db
      .select()
      .from(gameTable)
      .where(and(eq(gameTable.userId, user.id), eq(gameTable.isCompleted, false)));

    // Block hit if insurance is pending
    if (state.buttonState & ButtonFlags.Insurance) {
      throw new CustomError('Insurance must be decided before taking actions');
    }

    const deck = [...state.deck];
    const hands = [...state.playerHands];
    const currentHandIndex = state.currentHandIndex ?? 0;
    const hand = [...hands[currentHandIndex]];

    hand.push(deck.pop()!);
    hands[currentHandIndex] = hand;

    const handValue = calculateHandValue(hand);
    let buttons = state.buttonState & ~ButtonFlags.DoubleDown;
    let message = `Card added.`;

    let isCompleted = false;
    let newHandIndex = currentHandIndex;

    if (handValue.value > 21) {
      message = `Bust!`;
      buttons = 0;

      if (hands.length > currentHandIndex + 1) {
        newHandIndex++;
        buttons = ButtonFlags.Hit | ButtonFlags.Stand | ButtonFlags.DoubleDown;
      } else {
        isCompleted = true;
      }
    }

    const [updatedGame] = await db
      .update(gameTable)
      .set({
        playerHands: hands,
        buttonState: buttons,
        message,
        deck,
        isCompleted,
        currentHandIndex: newHandIndex,
      })
      .where(eq(gameTable.id, state.id))
      .returning();

    return responseObject({
      type: 'SUCCESS',
      message: 'Hit successful',
      showToast: true,
    });
  } catch (e) {
    console.error(e);
    return ErrorCatcher(e);
  }
};

export const stand = async () => {
  try {
    const user = await isAuthorized('Default');

    const gameResult = await db.transaction(async (tx) => {
      const [state] = await tx
        .select()
        .from(gameTable)
        .where(and(eq(gameTable.userId, user.id), eq(gameTable.isCompleted, false)));

      // Block stand if insurance is pending
      if (state.buttonState & ButtonFlags.Insurance) {
        throw new CustomError('Insurance must be decided before standing');
      }

      const hands = [...state.playerHands];
      const currentHandIndex = state.currentHandIndex ?? 0;

      // If more hands to play, just move to next hand
      if (hands.length > currentHandIndex + 1) {
        await tx
          .update(gameTable)
          .set({
            currentHandIndex: currentHandIndex + 1,
            buttonState: ButtonFlags.Hit | ButtonFlags.Stand | ButtonFlags.DoubleDown,
            message: `Moved to next hand`,
          })
          .where(eq(gameTable.id, state.id));

        return { message: 'Moved to next hand' };
      }

      // Dealer's turn
      const deck = [...state.deck];
      let dealerHand = [...state.dealerHand];
      let dealerValue = calculateHandValue(dealerHand);

      while (dealerValue.value < 17 || (dealerValue.isSoft && dealerValue.value === 17)) {
        dealerHand.push(deck.pop()!);
        dealerValue = calculateHandValue(dealerHand);
      }

      // Calculate results
      const currentBet = parseFloat(state.currentBet);
      const results: string[] = hands.map((hand) => {
        const playerValue = calculateHandValue(hand);

        if (playerValue.value > 21) return 'Lose';
        if (dealerValue.value > 21) return 'Win';
        if (playerValue.value > dealerValue.value) return 'Win';
        if (playerValue.value < dealerValue.value) return 'Lose';
        return 'Push';
      });

      // Calculate balance change
      const balanceChange = results.reduce((total, result) => {
        switch (result) {
          case 'Win':
            return total + currentBet; // Win pays 1:1
          case 'Lose':
            return total - currentBet;
          default:
            return total; // Push: no change
        }
      }, 0);

      // Update balance
      const newBalance = await updateBalance(tx, user.id, balanceChange);

      // Update game state
      await tx
        .update(gameTable)
        .set({
          dealerHand,
          buttonState: 0,
          message: `Results: ${results.join(', ')}`,
          deck,
          isCompleted: true,
          balance: newBalance.toString(),
        })
        .where(eq(gameTable.id, state.id));

      return { message: 'Stand completed', results };
    });

    return responseObject({
      type: 'SUCCESS',
      message: gameResult.message,
      showToast: true,
    });
  } catch (e) {
    console.error(e);
    return ErrorCatcher(e);
  }
};

export const doubleDown = async () => {
  try {
    const user = await isAuthorized('Default');

    const gameResult = await db.transaction(async (tx) => {
      const [state] = await tx
        .select()
        .from(gameTable)
        .where(and(eq(gameTable.userId, user.id), eq(gameTable.isCompleted, false)));

      // Block double down if insurance is pending
      if (state.buttonState & ButtonFlags.Insurance)
        throw new CustomError('Insurance must be decided before doubling down');
      if (!(state.buttonState & ButtonFlags.DoubleDown)) throw new CustomError('Double Down not allowed');

      const deck = [...state.deck];
      const hands = [...state.playerHands];
      const currentHandIndex = state.currentHandIndex ?? 0;
      const hand = [...hands[currentHandIndex]];

      if (hand.length !== 2) throw new CustomError('Invalid Double Down');

      // Double the bet and deduct from balance
      const currentBet = parseFloat(state.currentBet);
      const newBalance = await updateBalance(tx, user.id, -currentBet);

      // Add one card and stand
      hand.push(deck.pop()!);
      hands[currentHandIndex] = hand;

      // Prepare final state
      const finalState: Partial<GameState> = {
        playerHands: hands,
        deck,
        currentBet: (currentBet * 2).toString(),
        balance: newBalance.toString(),
      };

      if (hands.length > currentHandIndex + 1) {
        // More hands to play
        await tx
          .update(gameTable)
          .set({
            ...finalState,
            currentHandIndex: currentHandIndex + 1,
            buttonState: ButtonFlags.Hit | ButtonFlags.Stand | ButtonFlags.DoubleDown,
            message: `Doubled down. Moved to next hand`,
          })
          .where(eq(gameTable.id, state.id));

        return { message: 'Double down successful. Moving to next hand' };
      } else {
        // Last hand, proceed with dealer's turn
        let dealerHand = [...state.dealerHand];
        let dealerValue = calculateHandValue(dealerHand);

        while (dealerValue.value < 17 || (dealerValue.isSoft && dealerValue.value === 17)) {
          dealerHand.push(deck.pop()!);
          dealerValue = calculateHandValue(dealerHand);
        }

        // Calculate results
        const results: string[] = hands.map((hand) => {
          const playerValue = calculateHandValue(hand);

          if (playerValue.value > 21) return 'Lose';
          if (dealerValue.value > 21) return 'Win';
          if (playerValue.value > dealerValue.value) return 'Win';
          if (playerValue.value < dealerValue.value) return 'Lose';
          return 'Push';
        });

        // Calculate balance change
        const balanceChange = results.reduce((total, result) => {
          switch (result) {
            case 'Win':
              return total + currentBet; // Win pays 1:1
            case 'Lose':
              return total - currentBet;
            default:
              return total; // Push: no change
          }
        }, 0);

        // Update balance
        const newBalance = await updateBalance(tx, user.id, balanceChange);

        // Update game state
        await tx
          .update(gameTable)
          .set({
            ...finalState,
            dealerHand,
            buttonState: 0,
            message: `Results: ${results.join(', ')}`,
            deck,
            isCompleted: true,
            currentHandIndex: undefined,
            balance: newBalance.toString(),
          })
          .where(eq(gameTable.id, state.id));

        return {
          message: 'Double down completed',
          results,
        };
      }
    });

    return responseObject({
      type: 'SUCCESS',
      message: gameResult.message,
      showToast: true,
    });
  } catch (e) {
    console.error(e);
    return ErrorCatcher(e);
  }
};

export const split = async () => {
  try {
    const user = await isAuthorized('Default');

    const gameResult = await db.transaction(async (tx) => {
      const [state] = await tx
        .select()
        .from(gameTable)
        .where(and(eq(gameTable.userId, user.id), eq(gameTable.isCompleted, false)));

      // Block split if insurance is pending
      if (state.buttonState & ButtonFlags.Insurance) {
        throw new CustomError('Insurance must be decided before splitting');
      }

      if (!(state.buttonState & ButtonFlags.Split)) {
        throw new CustomError('Split not allowed');
      }

      const deck = [...state.deck];
      const currentHandIndex = state.currentHandIndex ?? 0;
      const hand = state.playerHands[currentHandIndex];

      if (hand.length !== 2 || hand[0].rank !== hand[1].rank) {
        throw new CustomError('Cannot split');
      }

      // Deduct bet for the second hand
      const currentBet = parseFloat(state.currentBet);
      const newBalance = await updateBalance(tx, user.id, -currentBet);

      // Create two new hands
      const hands = [
        [hand[0], deck.pop()!],
        [hand[1], deck.pop()!],
      ];

      await tx
        .update(gameTable)
        .set({
          playerHands: hands,
          buttonState: ButtonFlags.Hit | ButtonFlags.Stand | ButtonFlags.DoubleDown,
          message: 'Hand split',
          deck,
          currentHandIndex: 0, // Reset to first hand
          balance: newBalance.toString(),
          currentBet: currentBet.toString(), // Keep original bet value
        })
        .where(eq(gameTable.id, state.id));

      return { message: 'Split successful' };
    });

    return responseObject({
      type: 'SUCCESS',
      message: gameResult.message,
      showToast: true,
    });
  } catch (e) {
    console.error(e);
    return ErrorCatcher(e);
  }
};

export const insurance = async () => {
  try {
    const takeInsurance = true;
    const user = await isAuthorized('Default');

    const gameResult = await db.transaction(async (tx) => {
      const [state] = await tx
        .select()
        .from(gameTable)
        .where(and(eq(gameTable.userId, user.id), eq(gameTable.isCompleted, false)));

      if (!(state.buttonState & ButtonFlags.Insurance)) {
        throw new CustomError('Insurance not available');
      }

      const dealerValue = calculateHandValue(state.dealerHand);
      const currentBet = parseFloat(state.currentBet);
      const insuranceBet = currentBet / 2; // Standard insurance is half the original bet

      let newBalance = parseFloat(state.balance);
      let message = '';
      let isCompleted = false;
      let buttons = 0;

      if (takeInsurance) {
        // Insurance taken
        const balanceChange = dealerValue.value === 21 ? insuranceBet : -insuranceBet;
        newBalance = await updateBalance(tx, user.id, balanceChange);
        message =
          dealerValue.value === 21 ? `Insurance pays out: +${insuranceBet}` : `Insurance lost: -${insuranceBet}`;

        // If dealer has Blackjack, game is completed
        isCompleted = dealerValue.value === 21;
        buttons = dealerValue.value === 21 ? 0 : ButtonFlags.Hit | ButtonFlags.Stand | ButtonFlags.DoubleDown;
      } else {
        // Insurance denied
        message =
          dealerValue.value === 21 ? 'Dealer has Blackjack. Game over.' : 'Insurance declined. Continue playing.';

        // If dealer has Blackjack, game is completed
        isCompleted = dealerValue.value === 21;
        buttons = dealerValue.value === 21 ? 0 : ButtonFlags.Hit | ButtonFlags.Stand | ButtonFlags.DoubleDown;
      }

      // Update game state
      await tx
        .update(gameTable)
        .set({
          buttonState: buttons,
          message,
          isCompleted,
          balance: newBalance.toString(),
        })
        .where(eq(gameTable.id, state.id));

      return { message, isCompleted };
    });

    return responseObject({
      type: 'SUCCESS',
      message: gameResult.message,
      showToast: true,
    });
  } catch (e) {
    console.error(e);
    return ErrorCatcher(e);
  }
};

export const signOut = async () => {
  try {
    const { session } = await validateSessionToken();
    if (!session) throw new CustomError('You must be logged in.');

    await invalidateSession(session.id);
    await deleteSessionTokenCookie();

    return responseObject({
      type: 'SUCCESS',
      message: 'Signed out successfully.',
      showToast: false,
      redirect: '/signin',
    });
  } catch (e: unknown) {
    ErrorCatcher(e);
  }
};
