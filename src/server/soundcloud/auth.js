import fetch from 'node-fetch';

let cachedToken = null;
let tokenExpiresAt = null;
let tokenPromise = null;

export async function getSoundCloudToken() {
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
      params.append('client_id', process.env.SOUNDCLOUD_CLIENT_ID);
      params.append('client_secret', process.env.SOUNDCLOUD_CLIENT_SECRET);

      const response = await fetch('https://api.soundcloud.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`SoundCloud error: ${response.status} - ${errorData}`);
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
