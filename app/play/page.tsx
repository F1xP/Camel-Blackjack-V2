'use client';
import React from 'react';
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
  const { data: gameState, isLoading, isError } = useCurrentGame();

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (isError) return <div className="text-red-300">Error loading game</div>;
  if (!gameState) return <div className="text-white">No game data available</div>;

  return (
    <>
      <p>Game Message: {gameState.message}</p>
      <p>Game Balance: {gameState.balance}</p>
      <div className="bg-secondary flex flex-col w-full">
        <HandDisplay
          hand={gameState.dealerHand}
          result={gameState.message}
          gameId={gameState.id}
        />
        {gameState?.playerHands.map((hand, handIndex) => (
          <HandDisplay
            key={`${handIndex}-${gameState.id}`}
            hand={hand}
            isCurrentHand={handIndex === gameState.currentHandIndex}
            result={gameState.message}
            gameId={gameState.id}
          />
        ))}
      </div>
    </>
  );
};

export default BlackjackGame;
