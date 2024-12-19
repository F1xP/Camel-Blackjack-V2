import React from 'react';
import { Card } from '@/lib/bj-utils';
import { motion } from 'framer-motion';
import { CardBackSVG } from './CardBack';

export const CardDisplay = ({
  card,
  index = 0,
  totalCards = 1,
  gameId,
  isVisible = false,
}: {
  card?: Card | undefined;
  index?: number;
  totalCards?: number;
  gameId: string;
  isVisible?: boolean;
}) => {
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

  const stackOffset = Math.min(index * 20, 80);

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
        x: -200,
        y: stackOffset,
        rotate: Math.random() * 10 - 5,
      }}
      animate={
        isVisible
          ? {
              opacity: 1,
              scale: 1,
              x: stackOffset,
              y: stackOffset,
              rotate: 0,
            }
          : {}
      }
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        duration: 0.5,
      }}
      className="absolute top-0 left-0 w-full"
      style={{
        zIndex: totalCards - index,
      }}>
      <div className="border border-black bg-white rounded-md shadow-md w-full max-w-[3rem] sm:max-w-[4rem] aspect-[2/3] flex flex-col relative mx-auto overflow-hidden">
        {card ? (
          <div className={`absolute top-0.5 right-0.5 flex flex-col items-center ${suitColors[card?.suit ?? 'H']}`}>
            <span className="text-lg sm:text-sm font-bold">{card.rank}</span>
            <span className="text-sm sm:text-sm">{suitSymbols[card.suit]}</span>
          </div>
        ) : (
          <div className="absolute top-0.5 right-0.5 flex flex-col items-center">
            <CardBackSVG />
          </div>
        )}
      </div>
    </motion.div>
  );
};
