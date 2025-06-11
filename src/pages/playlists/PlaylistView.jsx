import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { playlistsApi } from "../../api/playlists";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { PlaylistHeader } from "../../components/playlist/PlaylistHeader";
import { PlaylistTracks } from "../../components/playlist/PlaylistTracks";
import "./PlaylistLibrary.css";

const PlaylistView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = await playlistsApi.getPlaylistWithTracks(id);
        setPlaylist(data);
      } catch (err) {
        console.error("Ошибка при загрузке плейлиста:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  if (error || !playlist) {
    return (
      <div className="error-container">
        <p>{error || "Плейлист не найден"}</p>
      </div>
    );
  }

  return (
    <div className="playlist-root">
      <PlaylistHeader 
        playlist={playlist} 
        onBack={() => navigate(-1)} 
      />
      <PlaylistTracks tracks={playlist.tracks} />
    </div>
  );
};

export default PlaylistView;
