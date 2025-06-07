import fetch from 'node-fetch';

export async function fetchAllTracks(playlistId, accessToken, total) {
  const allItems = [];
  const limit = 100;

  for (let offset = 0; offset < total; offset += limit) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      timeout: 5000
    });

    if (!response.ok) {
      throw new Error(`Spotify API error during pagination: ${response.status}`);
    }

    const pageData = await response.json();
    allItems.push(...pageData.items);
  }

  return allItems;
}

