'use client';
import { Card } from '@/lib/bj-utils';
import React from 'react';
import { HandValue } from './HandValue';
import { CardDisplay } from './Card';

export const HandDisplay = ({ hand, isCurrentHand = false }: { hand: Card[]; isCurrentHand?: boolean }) => {
  return (
    <div className={`p-4 rounded-lg relative min-h-[12rem] flex flex-col justify-end`}>
      {/* Hand Value */}
      <div className="absolute top-4 right-4">
        <HandValue hand={hand} />
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
