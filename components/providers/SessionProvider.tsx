'use client';
import { SessionValidationResult, validateSessionToken } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext } from 'react';

type ContextType = Awaited<ReturnType<typeof validateSessionToken>>;

const SessionContext = createContext<ContextType>({
  session: null,
  user: null,
});

export const useSession = () => {
  const sessionContext = useContext(SessionContext);
  if (!sessionContext) throw new Error('Session Context must be used within a SessionProvider');
  return sessionContext;
};

export const SessionProvider = ({
  children,
  initialValue,
}: React.PropsWithChildren<{
  initialValue: SessionValidationResult;
}>) => {
  const { data: value } = useQuery({
    queryKey: ['session'],
    queryFn: async () => await validateSessionToken(),
    initialData: initialValue,
  });

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
