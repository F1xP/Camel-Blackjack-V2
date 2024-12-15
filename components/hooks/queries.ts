'use server';
import { db } from '@/drizzle/db';
import gameTable from '@/drizzle/schema/game';
import { and, desc, eq } from 'drizzle-orm';

export const getGame = async (userId: string) => {
  const activeGame = await db
    .select()
    .from(gameTable)
    .where(and(eq(gameTable.userId, userId), eq(gameTable.isCompleted, false)))
    .limit(1);

  if (activeGame.length > 0) {
    const state = activeGame[0];
    if (state.buttonState !== 0) state.dealerHand.pop();
    return state;
  }

  const latestGame = await db
    .select()
    .from(gameTable)
    .where(eq(gameTable.userId, userId))
    .orderBy(desc(gameTable.createdAt))
    .limit(1);

  if (latestGame.length > 0) return latestGame[0];

  return null;
};
