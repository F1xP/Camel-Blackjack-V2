import { validateSessionToken } from '@/lib/auth';
import axios from 'axios';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import accountTable from '@/drizzle/schema/account';

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateSessionToken();
    if (!user)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=security&type=error&message=${encodeURIComponent(
          'You must be signed in.'
        )}`,
        {
          status: 307,
        }
      );

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) throw new Error();

    const GOOGLE_ID = process.env.GOOGLE_ID!;
    const GOOGLE_SECRET = process.env.GOOGLE_SECRET!;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/link`;

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

    const [userExists] = await db
      .select({ id: accountTable.id })
      .from(accountTable)
      .where(eq(accountTable.googleId, userInfo.id));

    if (userExists)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=security&type=error&message=${encodeURIComponent(
          'This account is already linked to another user.'
        )}`,
        {
          status: 307,
        }
      );

    await db
      .insert(accountTable)
      .values({
        userId: user.id,
        googleEmail: userInfo.email,
        googleId: userInfo.id,
        googleUsername: userInfo.name,
      })
      .onConflictDoUpdate({
        target: accountTable.userId,
        set: {
          googleEmail: userInfo.email,
          googleId: userInfo.id,
          googleUsername: userInfo.name,
        },
      });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=security&type=success&message=${encodeURIComponent(
        'Google account has been successfully linked.'
      )}`,
      { status: 307 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occured.';
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=security&type=error&message=${encodeURIComponent(errorMessage)}`,
      {
        status: 307,
      }
    );
  }
}
