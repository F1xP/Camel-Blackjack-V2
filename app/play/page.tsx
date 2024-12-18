'use client';
import React from 'react';
import { GameState } from '@/drizzle/schema/game';
import { useCurrentGame } from '@/components/hooks/useCurrentGame';
import { GameButtons } from './components/ui/GameButtons';
import { StartGame } from './components/ui/StartGame';
import { HandDisplay } from './components/ui/HandDisplay';

const BlackjackGame = () => {
  return (
    <div className="border flex flex-col p-4 w-full h-full gap-2">
      <StartGame />
      <GameDisplay />
      <GameButtons />
    </div>
  );
};

const GameDisplay = () => {
  const { data: game, isLoading, isError } = useCurrentGame();

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (isError) return <div className="text-red-300">Error loading game</div>;
  if (!game) return <div className="text-white">No game data available</div>;

  const gameState: GameState = game ?? {
    id: '',
    userId: '',
    playerHands: [],
    dealerHand: [],
    buttonState: 0,
    deck: [],
    balance: '100',
    currentBet: '0',
    currentHandIndex: 0,
    isCompleted: false,
    message: '',
    createdAt: new Date(Date.now()),
    updatedAt: new Date(Date.now()),
  };

  return (
    <>
      <p>Game Message: {gameState.message}</p>
      <p>Game Balance: {gameState.balance}</p>
      <div className="bg-secondary flex flex-col w-full">
        <HandDisplay hand={gameState.dealerHand} />
        {gameState?.playerHands.map((hand, handIndex) => (
          <HandDisplay
            key={handIndex}
            hand={hand}
            isCurrentHand={handIndex === gameState.currentHandIndex}
          />
        ))}
      </div>
    </>
  );
};

export default BlackjackGame;
