'use client';
import React from 'react';
import { useHandValue } from '@/components/hooks/useHandValue';
import { Card } from '@/lib/bj-utils';
import { motion } from 'framer-motion';

export const HandValue = ({ hand }: { hand: Card[] }) => {
  const { displayValue, alternativeValue } = useHandValue(hand);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col gap-0.5">
      <p className={`px-2 text-black font-bold font-mono rounded-sm text-center`}>Status Text</p>
      <p className={`px-2 text-black font-bold font-mono rounded-sm text-center`}>
        {alternativeValue ? `${displayValue}/${alternativeValue}` : displayValue}
      </p>
    </motion.div>
  );
};
