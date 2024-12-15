import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@/drizzle/schema/db-enums';

export const protectedRouteAsync = async (role: Role | null) => {
  try {
    const user = await getCurrentUser();
    if (!user && role !== null) return redirect('/');
    else if (user && role === null) return redirect('/');
    else if (user?.role === 'Owner' || (user?.role === 'Admin' && role === 'Default') || user?.role === role)
      return user;
    else return redirect('/');
  } catch (e) {
    if (isRedirectError(e)) throw e;
  }
};
