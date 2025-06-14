import { useState, useEffect } from "react";
import { Music } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { playlistsApi } from "../../api/playlists";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { PlaylistCard } from "../../components/playlist/PlaylistCard";
import "./PlaylistLibrary.css";

const PlaylistLibrary = () => {
  const [activeTab, setActiveTab] = useState("created");
  const [createdPlaylists, setCreatedPlaylists] = useState([]);
  const [likedPlaylists, setLikedPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user) {
      loadPlaylists(user.id);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadPlaylists = async (userId) => {
    try {
      const { created, liked } = await playlistsApi.fetchUserLibrary(userId);
      setCreatedPlaylists(created);
      setLikedPlaylists(liked);
    } catch (error) {
      console.error("Ошибка при загрузке плейлистов:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = (updatedPlaylist) => {
    const updateList = (list) =>
      list.map((p) => (p.id === updatedPlaylist.id ? updatedPlaylist : p));

    setCreatedPlaylists((prev) => updateList(prev));

    setLikedPlaylists((prev) => {
      if (updatedPlaylist.is_liked) {
        const exists = prev.some((p) => p.id === updatedPlaylist.id);
        return exists ? updateList(prev) : [...prev, updatedPlaylist];
      } else {
        return prev.filter((p) => p.id !== updatedPlaylist.id);
      }
    });
  };

  const TabContent = ({ playlists }) => {
    if (loading || authLoading) {
      return <LoadingSpinner />;
    }

    if (playlists.length === 0) {
      return (
        <div className="empty-state">
          <Music className="empty-state-icon w-12 h-12" />
          <p>
            {activeTab === "created"
              ? "У вас пока нет созданных плейлистов"
              : "У вас пока нет понравившихся плейлистов"}
          </p>
        </div>
      );
    }

    return (
      <div className="playlists-grid">
        {playlists.map((playlist) => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            onLikeToggle={handleLikeToggle}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="playlists-page">
      <div className="playlists-container">
        <div className="playlists-header">
          <h1 className="playlists-title">Мои плейлисты</h1>

          <div className="playlists-tabs">
            <button
              onClick={() => setActiveTab("created")}
              className={`playlists-tab ${
                activeTab === "created" ? "active" : ""
              }`}
            >
              Созданные ({createdPlaylists.length})
            </button>
            <button
              onClick={() => setActiveTab("liked")}
              className={`playlists-tab ${
                activeTab === "liked" ? "active" : ""
              }`}
            >
              Понравившиеся ({likedPlaylists.length})
            </button>
          </div>
        </div>

        <TabContent
          playlists={
            activeTab === "created" ? createdPlaylists : likedPlaylists
          }
        />
      </div>
    </div>
  );
};

export default PlaylistLibrary;
