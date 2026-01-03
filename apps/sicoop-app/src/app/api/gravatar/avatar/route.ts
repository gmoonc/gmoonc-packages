import { NextRequest, NextResponse } from 'next/server';
import { fetchGravatarAvatarByEmail } from '@/lib/gravatar';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  try {
    const avatarUrl = await fetchGravatarAvatarByEmail(email);

    if (!avatarUrl) {
      return NextResponse.json({ avatarUrl: null }, { status: 404 });
    }

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error('Unexpected error resolving Gravatar avatar:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
