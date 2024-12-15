import { boolean, jsonb, numeric, pgTable, smallint, timestamp, uuid, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import userTable from './user';

type Card = {
  suit: 'H' | 'D' | 'C' | 'S';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
};

const gameTable = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),

  // Player hands with multiple possible hands (for split)
  playerHands: jsonb('player_hands').$type<Card[][]>().notNull(),

  // Dealer's hand
  dealerHand: jsonb('dealer_hand').$type<Card[]>().notNull(),

  // Button state to track available actions
  buttonState: smallint('button_state').notNull().default(0),

  // Game status message
  message: varchar('message', { length: 255 }),

  // Remaining deck
  deck: jsonb('deck').$type<Card[]>().notNull(),

  // Player's balance
  balance: numeric('balance', { precision: 10, scale: 2 }).notNull().default('1000'),

  // Current bet amount
  currentBet: numeric('current_bet', { precision: 10, scale: 2 }).notNull().default('10'),

  // Track which hand is currently active (for split gameplay)
  currentHandIndex: integer('current_hand_index').notNull().default(0),

  // Game completion status
  isCompleted: boolean('is_completed').notNull().default(false),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const gameTableRelations = relations(gameTable, ({ one, many }) => {
  return {
    user: one(userTable, {
      fields: [gameTable.userId],
      references: [userTable.id],
    }),
  };
});

export default gameTable;

export type GameState = typeof gameTable.$inferSelect;
