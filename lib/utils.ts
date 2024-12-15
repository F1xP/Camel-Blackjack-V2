import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { fromZodError } from 'zod-validation-error';
import { CustomError, ResponseObjectType } from './types';
import { differenceInCalendarDays, format, formatDistance, isToday, isYesterday, subDays } from 'date-fns';
import { Role } from '@/drizzle/schema/db-enums';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const toBigFirstLetter = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getErrorMessage = (error: unknown): string => {
  let message: string;
  if (error instanceof Error) message = error.message;
  else if (error && typeof error === 'object' && 'message' in error) message = String(error.message);
  else if (typeof error === 'string') message = error;
  else message = 'An unexpected error occured.';
  return message;
};

export const responseObject = (response: ResponseObjectType) => {
  return {
    type: response.type,
    message: response.message,
    showToast: response.showToast,
    redirect: response.redirect,
  };
};

export const ErrorCatcher = (e: any, showToast: boolean = true) => {
  try {
    if (e instanceof CustomError) {
      return responseObject({
        type: 'ERROR',
        message: getErrorMessage(e),
        showToast: showToast,
      });
    }

    const validationError = fromZodError(e);
    const formattedMessage = validationError.message.split(' ').slice(2, -2).join(' ') + '.';

    const finalMessage = formattedMessage || 'An error occurred.';

    return responseObject({
      type: 'WARNING',
      message: finalMessage,
      showToast: showToast,
    });
  } catch (e) {
    return responseObject({
      type: 'ERROR',
      message: 'An unexpected error occured.',
      showToast: showToast,
    });
  }
};

export const convertDateToString = (date: Date): string => {
  return formatDistance(subDays(new Date(date), 0), new Date(), { addSuffix: true });
};

export const convertFormData = async (values: any, formData: FormData) => {
  Object.entries(values).forEach(([key, value]) => {
    if (Object.prototype.toString.call(value) === '[object Date]') {
      formData.append(key, (value as Date).toISOString());
    } else if (typeof value === 'string' || value instanceof Blob) {
      formData.append(key, value as string | Blob);
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    }
  });
};

export const getDayLabel = (date: Date) => {
  const daysDifference = differenceInCalendarDays(new Date(), date);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (daysDifference < 7) return format(date, 'EEEE');
  return format(date, 'MMMM d, yyyy');
};

export const isAuthorizedToAccessUI = (requiredRole: Role, role: Role | undefined): boolean => {
  if (!role) return false; // User without a role is not authorized

  const roleHierarchy = ['Default', 'Admin', 'Owner'] as const;
  const userRoleIndex = roleHierarchy.indexOf(role);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

  // If the user's role is lower than the required role, return false
  return userRoleIndex >= requiredRoleIndex;
};

export const isValidUUID = (id: string | undefined) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return id !== undefined && uuidRegex.test(id);
};
