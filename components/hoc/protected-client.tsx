'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from '../providers/SessionProvider';
import { useRouter } from 'next/navigation';
import { Role } from '@/drizzle/schema/db-enums';

export default function ProtectedRoute(role: Role | null, Component: any) {
  const ProtectedComponent = (props: any) => {
    const { user, session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!user && role !== null) router.push('/');
      else if (user && role === null) router.push('/');
      else if (user?.role === 'Owner' || (user?.role === 'Admin' && role === 'Default') || user?.role === role)
        return setLoading(false);
      else setLoading(false);
    }, [user, , router]);
    if (loading) return null;
    return <Component {...props} />;
  };

  return ProtectedComponent;
}
