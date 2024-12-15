import { calculateHandValue, Card } from '@/lib/bj-utils';
import { useEffect, useState } from 'react';

export const useHandValue = (hand: Card[]) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [alternativeValue, setAlternativeValue] = useState<number | null>(null);

  useEffect(() => {
    if (hand.length === 0) {
      setDisplayValue(0);
      setAlternativeValue(null);
      return;
    }

    const { value, isSoft, alternativeValue: altValue } = calculateHandValue(hand);

    setDisplayValue(value);
    setAlternativeValue(altValue ?? null);
  }, [hand]);

  return { displayValue, alternativeValue };
};
