'use client';
import React, { useState } from 'react';
import { initializeGame } from '@/components/actions/actions';
import { useQueryClient } from '@tanstack/react-query';
import { Dice5 } from 'lucide-react';

export const StartGame = () => {
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
  );
};
