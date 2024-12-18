'use client';
import { doubleDown, hit, insurance, split, stand } from '@/components/actions/actions';
import { useCurrentGame } from '@/components/hooks/useCurrentGame';
import { Button } from '@/components/ui/Button';
import { GameState } from '@/drizzle/schema/game';
import { ResponseObjectType } from '@/lib/types';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';

enum ButtonFlags {
  Hit = 1 << 0,
  Stand = 1 << 1,
  DoubleDown = 1 << 2,
  Split = 1 << 3,
  Insurance = 1 << 4,
}

export const GameButtons = () => {
  const queryClient = useQueryClient();
  const { data: game, isLoading } = useCurrentGame();

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

  const handleGameAction = async (action: () => Promise<ResponseObjectType>) => {
    if (!gameState?.id) return;
    const result = await action();
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
      action: insurance,
      flag: ButtonFlags.Insurance,
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {buttonActions.map(({ text, action, flag }) => (
        <Button
          key={text}
          variant={'default'}
          size={'sm'}
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
        </Button>
      ))}
    </div>
  );
};
