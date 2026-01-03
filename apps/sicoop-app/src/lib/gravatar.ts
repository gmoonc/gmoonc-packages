import crypto from 'crypto';

export type GravatarProfileResponse = {
  avatar_url?: string;
};

export function getGravatarHash(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  return crypto.createHash('sha256').update(normalizedEmail).digest('hex');
}

export async function fetchGravatarAvatarByEmail(email: string): Promise<string | null> {
  if (!email) {
    return null;
  }

  const apiBaseUrl = process.env.GRAVATAR_API_BASE_URL;
  const apiKey = process.env.GRAVATAR_API_KEY;

  if (!apiBaseUrl || !apiKey) {
    console.error('Gravatar configuration missing. Ensure GRAVATAR_API_BASE_URL and GRAVATAR_API_KEY are set.');
    return null;
  }

  const gravatarHash = getGravatarHash(email);
  const sanitizedBaseUrl = apiBaseUrl.replace(/\/$/, '');
  const url = `${sanitizedBaseUrl}/profiles/${gravatarHash}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error(`Failed to fetch Gravatar profile: ${response.status} ${response.statusText}`);
      return null;
    }

    const profile: GravatarProfileResponse = await response.json();
    return profile.avatar_url ?? null;
  } catch (error) {
    console.error('Error fetching Gravatar profile:', error);
    return null;
  }
}
