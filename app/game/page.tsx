'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { doubleDown, hit, initializeGame, split, stand, takeInsurance } from '@/components/actions/actions';
import { Card } from '@/lib/bj-utils';
import { GameState } from '@/drizzle/schema/game';
import { useCurrentGame } from '@/components/hooks/useCurrentGame';
import { useQueryClient } from '@tanstack/react-query';
import { Dice5, Wallet } from 'lucide-react';
import { ResponseObjectType } from '@/lib/types';
import { useSession } from '@/components/providers/SessionProvider';
import { useHandValue } from '@/components/hooks/useHandValue';
import { toast } from 'sonner';

const AnimatedHandValue = ({ hand }: { hand: Card[] }) => {
  const { displayValue, alternativeValue } = useHandValue(hand);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-black/70 text-white px-2 py-1 rounded-lg text-sm font-semibold">
      {alternativeValue ? `${displayValue}/${alternativeValue}` : displayValue}
    </motion.div>
  );
};

const CardDisplay = ({ card, index = 0, totalCards = 1 }: { card?: Card; index?: number; totalCards?: number }) => {
  const suitSymbols = {
    H: '♥️',
    D: '♦️',
    C: '♣️',
    S: '♠️',
  };

  const suitColors = {
    H: 'text-red-600',
    D: 'text-red-600',
    C: 'text-black',
    S: 'text-black',
  };

  // Calculate stacking offset with responsive sizing
  const stackOffset = Math.min(index * 20, 80);

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
        rotate: Math.random() * 10 - 5,
        y: stackOffset,
        x: stackOffset,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
        y: stackOffset,
        x: stackOffset,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: index * 0.1,
      }}
      className="absolute top-0 left-0 w-full"
      style={{
        transform: `translateY(${stackOffset}px)`,
        zIndex: totalCards - index,
      }}>
      <div
        className={`
          bg-white rounded-md shadow-md 
          w-full max-w-[3rem] sm:max-w-[4rem] 
          aspect-[2/3] 
          flex flex-col 
          border-2 border-gray-200 relative
          mx-auto
          ${suitColors[card?.suit ?? 'H']}
        `}>
        {card ? (
          <div className="absolute top-0.5 right-0.5 flex flex-col items-center">
            <span className="text-lg sm:text-sm font-bold">{card.rank}</span>
            <span className="text-sm sm:text-sm">{suitSymbols[card.suit]}</span>
          </div>
        ) : (
          <span className="text-white text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            🂠
          </span>
        )}
      </div>
    </motion.div>
  );
};

const HandDisplay = ({
  hand,
  title,
  isCurrentHand = false,
}: {
  hand: Card[];
  title: string;
  isCurrentHand?: boolean;
}) => {
  return (
    <div
      className={`
        p-4 rounded-lg relative 
        ${isCurrentHand ? 'bg-blue-500/20 border-2 border-blue-500' : 'bg-white/10'}
        min-h-[12rem] flex flex-col justify-end
      `}>
      <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>

      {/* Hand Value */}
      <div className="absolute top-4 right-4">
        <AnimatedHandValue hand={hand} />
      </div>

      {/* Card Container with Relative Positioning */}
      <div className="relative h-36 w-full">
        {hand.map((card, index) => (
          <CardDisplay
            key={index}
            card={card}
            index={index}
            totalCards={hand.length}
          />
        ))}
      </div>
    </div>
  );
};

const BlackjackGame = () => {
  const { user } = useSession();
  const [betAmount, setBetAmount] = useState(10);
  const queryClient = useQueryClient();

  const startGame = async () => {
    try {
      await initializeGame(betAmount);
      queryClient.invalidateQueries({
        queryKey: ['getCurrentGame'],
      });
    } catch (error) {
      console.log('Game initialization failed', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-800 to-green-900 min-h-screen p-6 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Blackjack</h1>
          <div className="flex items-center gap-4">
            <Wallet className="text-white" />
            <span className="text-xl text-white font-semibold">{user?.balance}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            min="10"
            className="
              w-full p-3 rounded-lg 
              bg-white/20 text-white 
              placeholder-white/50 
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            placeholder="Enter bet amount"
          />
          <button
            onClick={startGame}
            className="
              flex items-center justify-center gap-2
              px-4 py-2 rounded-lg
              bg-blue-500 text-white hover:bg-blue-600 transition-colors
            ">
            <Dice5 size={20} />
            Deal
          </button>
        </div>

        <ShowGame />
      </div>
    </div>
  );
};

const ShowGame = () => {
  const queryClient = useQueryClient();
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

  const hasFlag = (flag: number) => (gameState?.buttonState ?? 0) & flag;

  const handleGameAction = async (action: (gameId: string) => Promise<ResponseObjectType>) => {
    if (!gameState?.id) return;
    const result = await action(game.id);
    toast.success(result.message);
    queryClient.invalidateQueries({ queryKey: ['getCurrentGame'] });
  };

  const buttonActions = [
    {
      text: 'Hit',
      action: hit,
      flag: ButtonFlags.Hit,
    },
    {
      text: 'Stand',
      action: stand,
      flag: ButtonFlags.Stand,
    },
    {
      text: 'Double',
      action: doubleDown,
      flag: ButtonFlags.DoubleDown,
    },
    {
      text: 'Split',
      action: split,
      flag: ButtonFlags.Split,
    },
    {
      text: 'Insurance',
      action: takeInsurance,
      flag: ButtonFlags.Insurance,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-black/30 p-4 rounded-lg text-center text-white font-semibold">{gameState?.message}</div>

      <HandDisplay
        hand={gameState.dealerHand}
        title="Dealer's Hand"
      />

      {gameState?.playerHands.map((hand, handIndex) => (
        <HandDisplay
          key={handIndex}
          hand={hand}
          title={`${gameState.playerHands.length > 1 ? `Player Hand ${handIndex + 1}` : 'Player Hand'}`}
          isCurrentHand={handIndex === gameState.currentHandIndex}
        />
      ))}

      <div className="grid grid-cols-5 gap-2">
        {buttonActions.map(({ text, action, flag }) => (
          <button
            key={text}
            onClick={() => handleGameAction(action)}
            disabled={!hasFlag(flag)}
            className={`
              flex items-center justify-center gap-2
              px-4 py-2 rounded-lg
              ${
                !hasFlag(flag)
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'
              }
            `}>
            {text}
          </button>
        ))}
      </div>

      <div className="text-center text-white text-lg mt-4">Current Balance: ${gameState.balance}</div>
    </div>
  );
};

enum ButtonFlags {
  Hit = 1 << 0,
  Stand = 1 << 1,
  DoubleDown = 1 << 2,
  Split = 1 << 3,
  Insurance = 1 << 4,
}

export default BlackjackGame;
