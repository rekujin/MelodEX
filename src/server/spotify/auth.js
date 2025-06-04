import fetch from 'node-fetch';

let cachedToken = null;
let tokenExpiresAt = null;
let tokenPromise = null;

export async function getSpotifyToken() {
  const now = Date.now();

  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt) {
    return cachedToken;
  }

  if (tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = (async () => {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');

      const auth = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64');

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Spotify error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();

      cachedToken = data.access_token;
      tokenExpiresAt = now + (data.expires_in * 1000) - 60000; // 1 минута запас

      return cachedToken;
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
}
