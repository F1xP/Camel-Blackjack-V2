'use client';

import { useQuery } from '@tanstack/react-query';
import { getGame } from './queries';
import { useSession } from '../providers/SessionProvider';

export const useCurrentGame = () => {
  const { user } = useSession();
  return useQuery({
    queryKey: ['getCurrentGame'],
    queryFn: async () => await getGame(user?.id as string),
    enabled: !!user?.id,
  });
};
