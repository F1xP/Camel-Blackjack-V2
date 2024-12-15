'use server';
import { validateSessionToken } from './auth';
import { CustomError } from './types';

export const isAuthorized = async (requiredRole: 'Default' | 'Admin' | 'Owner') => {
  const roleHierarchy = ['Default', 'Admin', 'Owner'] as const;

  const { user } = await validateSessionToken();
  if (!user) throw new CustomError('You must be logged in.');

  const { role } = user;

  const userRoleIndex = roleHierarchy.indexOf(role);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

  if (userRoleIndex < requiredRoleIndex) throw new CustomError('Unauthorized');
  return user;
};
