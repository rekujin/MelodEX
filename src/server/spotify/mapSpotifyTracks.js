export const mapSpotifyTracks = (tracks) => {
  if (!tracks) return { tracks: [], actualCount: 0 };
  
  const mappedTracks = tracks.map((track) => {
    if (!track || !track.track) return null;
    return {
      track: {
        id: track.track?.id || `spotify-${Date.now()}`,
        title: track.track?.name || 'Unknown Title',
        artists: track.track?.artists?.map(artist => ({
          name: artist?.name || 'Unknown Artist'
        })) || [],
        albums: track.track?.album ? [{
          title: track.track.album.name
        }] : [],
        cover: track.track?.album?.images?.[0]?.url || null,
        durationMs: track.track?.duration_ms || 0
      }
    };
  }).filter(Boolean);

  return { 
    tracks: mappedTracks, 
    actualCount: mappedTracks.length 
  };
};
