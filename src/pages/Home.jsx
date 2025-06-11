import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Heart, User } from "lucide-react";
import { playlistsApi } from "../api/playlists";
import { formatDuration } from "../helper/formatters";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import "./Home.css";
import "./playlists/PlaylistLibrary.css";
import "./profile/PublicProfile.css";

function Home() {
  const navigate = useNavigate();
  const [recentPlaylists, setRecentPlaylists] = useState([]);
  const [popularPlaylists, setPopularPlaylists] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);

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

  // Компонент карточки плейлиста
  const PlaylistCard = ({ playlist }) => (
    <div
      className="public-playlist-card"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className="public-playlist-cover">
        {playlist.avatar_url ? (
          <img src={playlist.avatar_url} alt={playlist.title} />
        ) : (
          <div className="public-playlist-placeholder">
            <Music size={24} className="public-playlist-placeholder-icon" />
          </div>
        )}
      </div>

      <div className="public-playlist-info">
        <h4 className="public-playlist-title">{playlist.title}</h4>

        <div className="public-playlist-meta">
          <div className="public-playlist-card-meta">
            <div className="public-playlist-meta-item">
              <Heart size={14} />
              <span>{playlist.likes_count || 0}</span>
            </div>

            <div
              className="public-playlist-meta-item"
              onClick={(e) => {
                e.stopPropagation();
                if (playlist.profiles?.username) {
                  navigate(`/user/${playlist.profiles.username}`);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <User size={14} />
              <span className="playlists-meta-author">
                {playlist.profiles?.username || 'Неизвестный автор'}
              </span>
            </div>
          </div>

          <div className="public-playlist-stats">
            {playlist.track_count || 0} треков
            {playlist.total_duration && (
              <> • {formatDuration(playlist.total_duration)}</>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="home-container">
      {/* Недавние плейлисты */}
      <div className="recent-playlists">
        <h2>Недавно созданные плейлисты</h2>
        {loadingRecent ? (
          <LoadingSpinner />
        ) : (
          <div className="public-playlists-grid">
            {recentPlaylists.map((playlist) => (
              <PlaylistCard key={`recent-${playlist.id}`} playlist={playlist} />
            ))}
          </div>
        )}
      </div>

      {/* Популярные плейлисты */}
      <div className="popular-playlists">
        <h2>Популярные плейлисты</h2>
        {loadingPopular ? (
          <LoadingSpinner />
        ) : (
          <div className="public-playlists-grid">
            {popularPlaylists.map((playlist) => (
              <PlaylistCard
                key={`popular-${playlist.id}`}
                playlist={playlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
