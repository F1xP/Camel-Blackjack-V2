'use server';
import { cookies } from 'next/headers';
import { db } from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';
import { AccountType, DrizzleTransaction, SessionType, UserType } from './types';
import { cache } from 'react';
import crypto from 'crypto'; // Import the crypto module
import sessionTable from '@/drizzle/schema/session';
import userTable from '@/drizzle/schema/user';
import accountTable from '@/drizzle/schema/account';

export async function generateSessionToken(): Promise<string> {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

function hashWithSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function createSession(token: string, userId: string, tx: DrizzleTransaction): Promise<SessionType> {
  const sessionId = hashWithSHA256(token); // Hash the token to create a session ID
  const session: SessionType = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await tx.insert(sessionTable).values(session);
  return session;
}

export type SessionValidationResult =
  | {
      session: SessionType;
      user: UserType & {
        account: AccountType | null;
      };
    }
  | { session: null; user: null };

export const validateSessionToken = cache(async function (): Promise<SessionValidationResult> {
  const sessionToken = (await cookies()).get('session')?.value ?? null;
  if (!sessionToken)
    return {
      user: null,
      session: null,
    };

  const sessionId = hashWithSHA256(sessionToken);
  const result = await db
    .select({
      user: userTable,
      account: accountTable,
      session: sessionTable,
    })
    .from(sessionTable)
    .where(eq(sessionTable.id, sessionId))
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .leftJoin(accountTable, eq(accountTable.userId, userTable.id));
  if (result.length < 1) return { session: null, user: null };

  const { user, account, session } = result[0];

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id));
  }

  return {
    session,
    user: {
      ...user,
      account,
    },
  };
});

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function setSessionTokenCookie(
  token: string,
  expiresAt: number = 1000 * 60 * 60 * 24 * 30
): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'production') {
      (await cookies()).set('session', token, {
        secure: true,
        maxAge: expiresAt,
        httpOnly: true,
        path: '/',
      });
    } else {
      (await cookies()).set('session', token, {
        secure: false,
        maxAge: expiresAt,
        httpOnly: true,
        path: '/',
      });
    }
  } catch (e) {
    console.log('next.js throws when you attempt to set cookie when rendering page, ignore');
  }
}

export async function deleteSessionTokenCookie(): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'production') {
      (await cookies()).set('session', '', {
        secure: true,
        maxAge: 0,
        httpOnly: true,
      });
    } else {
      (await cookies()).set('session', '', {
        secure: false,
        maxAge: 0,
        httpOnly: true,
      });
    }
  } catch (e) {
    console.log('next.js throws when you attempt to set cookie when rendering page, ignore');
  }
}
