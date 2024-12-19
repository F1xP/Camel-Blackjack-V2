'use client';
import { calculateHandValue, Card } from '@/lib/bj-utils';
import { useEffect, useState } from 'react';

export const useHandValue = (hand: Card[], visibleCards: number) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [alternativeValue, setAlternativeValue] = useState<number | null>(null);

  useEffect(() => {
    const visibleHand = hand.slice(0, visibleCards);
    const { value, isSoft, alternativeValue: altValue } = calculateHandValue(visibleHand);

    setDisplayValue(value);
    setAlternativeValue(altValue ?? null);
  }, [hand, visibleCards]);

  return { displayValue, alternativeValue };
};
