import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Music, Heart } from "lucide-react";
import supabase from "../../helper/supabaseClient";
import "./PublicProfile.css";

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Получаем профиль пользователя
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .eq("username", username)
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error("Профиль не найден");

        setProfile(profileData);

        // Получаем плейлисты пользователя (только первые 8)
        const { data: playlistsData, error: playlistsError } = await supabase
          .from("playlists")
          .select(
            `
            id,
            title,
            description,
            avatar_url,
            likes_count,
            track_count,
            total_duration,
            created_at
          `
          )
          .eq("author_id", profileData.id)
          .order("created_at", { ascending: false })
          .limit(6);

        if (!playlistsError && playlistsData) {
          setPlaylists(playlistsData);
        }
      } catch (err) {
        console.error("Ошибка при загрузке профиля:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  const PlaylistCard = ({ playlist }) => (
    <div
      className="public-playlist-card"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className="public-playlist-cover">
        <div className="public-playlist-placeholder">
          <Music size={24} className="public-playlist-placeholder-icon" />
        </div>
        {playlist.avatar_url && (
          <img src={playlist.avatar_url} alt={playlist.title} />
        )}
      </div>

      <div className="public-playlist-info">
        <h4 className="public-playlist-title">{playlist.title}</h4>

        <div className="public-playlist-meta">
          <div className="public-playlist-stats">
            <Heart className="public-playlist-stat-icon" />
            <span>{playlist.likes_count || 0}</span>
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

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="error-container">
        <p>Профиль не найден</p>
      </div>
    );
  }

  return (
    <div className="public-profile-page">
      <div className="public-profile-container">
        <div className="public-profile-card">
          <div className="public-profile-header">
            <h1 className="public-profile-title">Профиль пользователя</h1>
          </div>

          <div className="public-profile-content">
            <div className="public-profile-avatar">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="avatar-image"
                />
              ) : (
                <div className="public-profile-avatar-icon">
                  <User size={48}/>
                </div>
              )}
            </div>

            <h2 className="public-profile-username">{profile.username}</h2>
          </div>
        </div>

        {playlists.length > 0 && (
          <div className="public-playlists-section">
            <h3 className="public-playlists-title">Плейлисты пользователя</h3>
            <div className="public-playlists-grid">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
