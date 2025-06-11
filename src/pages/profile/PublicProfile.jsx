import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { User } from "lucide-react";
import { PlaylistCard } from "../../components/playlist/PlaylistCard";
import { playlistsApi } from "../../api/playlists";
import supabase from "../../helper/supabaseClient";
import "./PublicProfile.css";
import "../playlists/Playlists.css"

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .eq("username", username)
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error("Профиль не найден");

        setProfile(profileData);

        const userPlaylists = await playlistsApi.getUserPlaylists(profileData.id, 5);
        setPlaylists(userPlaylists.map(playlist => ({
          ...playlist,
          author: { username: profileData.username }
        })));
      } catch (err) {
        console.error("Ошибка при загрузке профиля:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

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
                  <User size={48} />
                </div>
              )}
            </div>

            <h2 className="public-profile-username">{profile.username}</h2>
          </div>
        </div>

        {playlists.length > 0 && (
          <div className="playlists-section">
            <h3 className="playlists-title">Плейлисты пользователя</h3>
            <div className="playlists-grid">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={{
                    ...playlist,
                    author: { username: profile.username },
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
