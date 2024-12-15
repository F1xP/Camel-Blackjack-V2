import { createSession, generateSessionToken, setSessionTokenCookie, validateSessionToken } from '@/lib/auth';
import axios from 'axios';
import { eq, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import accountTable from '@/drizzle/schema/account';
import userTable from '@/drizzle/schema/user';

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateSessionToken();
    if (user)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?type=error&message=${encodeURIComponent('You must be signed out.')}`,
        {
          status: 307,
        }
      );

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) throw new Error();

    const GOOGLE_ID = process.env.GOOGLE_ID!;
    const GOOGLE_SECRET = process.env.GOOGLE_SECRET!;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

    const { data: tokenData } = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_ID,
      client_secret: GOOGLE_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenData;
    const { data: userInfo } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    await db.transaction(async (tx) => {
      const [userExists] = await tx
        .select({
          id: accountTable.userId,
        })
        .from(accountTable)
        .leftJoin(userTable, eq(userTable.id, accountTable.userId))
        .where(or(eq(accountTable.googleId, userInfo.id), eq(userTable.email, userInfo.email)));

      if (userExists) {
        const token = await generateSessionToken();
        await createSession(token, userExists.id, tx);
        await setSessionTokenCookie(token);
      } else {
        const [newUser] = await tx
          .insert(userTable)
          .values({
            name: userInfo.name,
            email: userInfo.email,
            hashedPassword: '',
            passwordSalt: '',
          })
          .returning({ id: userTable.id });

        await tx
          .insert(accountTable)
          .values({
            userId: newUser.id,
            googleId: userInfo.id,
            googleUsername: userInfo.name,
            googleEmail: userInfo.email,
          })
          .onConflictDoUpdate({
            target: accountTable.userId,
            set: {
              googleId: userInfo.id,
              googleUsername: userInfo.name,
              googleEmail: userInfo.email,
            },
          });

        const token = await generateSessionToken();
        await createSession(token, newUser.id, tx);
        await setSessionTokenCookie(token);
      }
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`, {
      status: 307,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occured.';
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/signin?type=error&message=${encodeURIComponent(errorMessage)}`,
      {
        status: 307,
      }
    );
  }
}
