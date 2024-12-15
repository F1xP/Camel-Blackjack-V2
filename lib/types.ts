import accountTable from '@/drizzle/schema/account';
import sessionTable from '@/drizzle/schema/session';
import userTable from '@/drizzle/schema/user';
import { drizzle } from 'drizzle-orm/postgres-js';

export type SessionType = typeof sessionTable.$inferSelect;
export type UserType = Omit<typeof userTable.$inferSelect, 'hashedPassword' | 'passwordSalt' | 'updatedAt'>;

export type AccountType = typeof accountTable.$inferSelect;

export type ResponseObjectType =
  | { type: 'ERROR'; message: string; showToast: boolean; redirect?: string }
  | { type: 'SUCCESS'; message: string; showToast: boolean; redirect?: string }
  | { type: 'WARNING'; message: string; showToast: boolean; redirect?: string }
  | { type: 'INFO'; message: string; showToast: boolean; redirect?: string };

export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomError';
  }
}

export type Accounts = 'Github' | 'X' | 'Dribbble' | 'Google' | 'Discord';
export type DrizzleClient = ReturnType<typeof drizzle>;
export type DrizzleTransaction = Parameters<Parameters<DrizzleClient['transaction']>[0]>[0];
