import { useState, useEffect } from "react";
import { playlistsApi } from "../api/playlists";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { PlaylistCard } from "../components/playlist/PlaylistCard";
import "./Home.css";
import "./playlists/Playlists.css";
import "./profile/PublicProfile.css";

function Home() {
  const [recentPlaylists, setRecentPlaylists] = useState([]);
  const [popularPlaylists, setPopularPlaylists] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);

  const handleLikeToggle = (updatedPlaylist) => {
    // Обновляем оба списка одновременно
    setRecentPlaylists(prevPlaylists =>
      prevPlaylists.map(playlist =>
        playlist.id === updatedPlaylist.id
          ? updatedPlaylist
          : playlist
      )
    );

    setPopularPlaylists(prevPlaylists =>
      prevPlaylists.map(playlist =>
        playlist.id === updatedPlaylist.id
          ? updatedPlaylist
          : playlist
      )
    );
  };

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const [recentData, popularData] = await Promise.all([
          playlistsApi.getRecentPlaylists(),
          playlistsApi.getPopularPlaylists(),
        ]);

        setRecentPlaylists(recentData);
        setPopularPlaylists(popularData);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      } finally {
        setLoadingRecent(false);
        setLoadingPopular(false);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <div className="home-container">
      {/* Недавние плейлисты */}
      <div className="playlists-section">
        <h2 className="playlists-title">Новинки</h2>
        {loadingRecent ? (
          <LoadingSpinner />
        ) : (
          <div className="playlists-grid">
            {recentPlaylists.map((playlist) => (
              <PlaylistCard 
                key={`recent-${playlist.id}`} 
                playlist={{...playlist, author: { username: playlist.profiles?.username }}} 
                onLikeToggle={handleLikeToggle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Популярные плейлисты */}
      <div className="playlists-section">
        <h2 className="playlists-title">Популярные плейлисты</h2>
        {loadingPopular ? (
          <LoadingSpinner />
        ) : (
          <div className="playlists-grid">
            {popularPlaylists.map((playlist) => (
              <PlaylistCard 
                key={`popular-${playlist.id}`} 
                playlist={{...playlist, author: { username: playlist.profiles?.username }}} 
                onLikeToggle={handleLikeToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
