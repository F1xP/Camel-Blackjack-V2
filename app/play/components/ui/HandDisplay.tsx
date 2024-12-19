'use client';

import { Card } from '@/lib/bj-utils';
import React, { useState, useEffect } from 'react';
import { CardDisplay } from './Card';
import { useHandValue } from '@/components/hooks/useHandValue';
import { motion } from 'framer-motion';

export const HandDisplay = ({
  hand,
  isCurrentHand = false,
  result,
  gameId,
}: {
  hand: Card[];
  isCurrentHand?: boolean;
  result: string | null;
  gameId: string;
}) => {
  const [visibleCards, setVisibleCards] = useState(0);
  const { displayValue, alternativeValue } = useHandValue(hand, visibleCards);

  useEffect(() => {
    console.log(hand.length);
    const revealCards = async () => {
      for (const card of hand) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setVisibleCards((prev) => prev + 1);
      }
    };

    revealCards();
  }, [hand.length]);

  useEffect(() => {
    setVisibleCards(0);
  }, [gameId]);

  return (
    <div className="flex-center flex-col gap-2 p-4">
      <div className="flex flex-col max-w-fit gap-1">
        <p className="bg-gray rounded-sm py-0.5 px-2 text-text text-sm font-bold text-center">{result}</p>
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          key={`${gameId}-${displayValue}-${alternativeValue}`}
          className="bg-gray rounded-sm py-0.5 px-2 text-text text-sm font-bold text-center">
          {displayValue}
          {alternativeValue && `, ${alternativeValue}`}
        </motion.p>
      </div>

      <div className="relative h-36 w-full">
        {hand.map((card, index) => (
          <CardDisplay
            key={`${gameId}-${card.rank}-${card.suit}-${index}`}
            card={card}
            index={index}
            totalCards={hand.length}
            gameId={gameId}
            isVisible={index < visibleCards}
          />
        ))}
      </div>
    </div>
  );
};
