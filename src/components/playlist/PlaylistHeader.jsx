import { Music, Calendar, User, ArrowLeft, ExternalLink, Edit2, Trash2 } from "lucide-react";
import { formatDate } from "../../helper/formatters";
import { playlistsApi } from "../../api/playlists";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { ConfirmModal } from "../modals/ConfirmModal";

export const PlaylistHeader = ({ playlist, onBack }) => {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await playlistsApi.deletePlaylist(playlist.id);
      onBack();
    } catch (error) {
      console.error("Error deleting playlist:", error);
      alert("Не удалось удалить плейлист");
    }
  };

  const handleOpenOriginal = () => {
    if (playlist.playlist_url) {
      window.open(playlist.playlist_url, "_blank");
    }
  };

  return (
    <div className="playlist-header">
      <div className="playlist-header-inner">
        <button onClick={onBack} className="playlist-back-btn">
          <ArrowLeft size={20} />
          Назад
        </button>

        <div className="playlist-header-content">
          <div className="playlist-avatar-wrapper">
            <div className={`playlist-avatar ${playlist.avatar_url ? "has-image" : ""}`}>
              {playlist.avatar_url ? (
                <img
                  src={playlist.avatar_url}
                  alt="Обложка плейлиста"
                  className="playlist-avatar-image"
                />
              ) : (
                <Music className="playlist-avatar-icon" />
              )}
            </div>
          </div>

          <div className="playlist-info">
            <h1 className="playlist-title">{playlist.title}</h1>
            <p className="playlist-desc">{playlist.description}</p>

            <div className="playlist-meta-row">
              <div className="playlist-meta">
                <Music size={16} />
                <span>{playlist.tracks.length} треков</span>
              </div>
              <div className="playlist-meta">
                <Calendar size={16} />
                <span>{formatDate(playlist.created_at)}</span>
              </div>
              <div className="playlist-meta">
                <User size={16} />
                <span>{playlist.author?.username || "Неизвестный пользователь"}</span>
              </div>
            </div>
          </div>
        </div>

        {playlist.tags && playlist.tags.length > 0 && (
          <div className="playlist-tags-container">
            {playlist.tags.map((tag) => (
              <span key={tag} className="playlist-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {user && user.id === playlist.author_id && (
          <div className="playlist-actions-container">
            <button
              className="playlist-actions-link"
              onClick={handleOpenOriginal}
              disabled={!playlist.playlist_url}
            >
              <ExternalLink size={20} />
            </button>
            <button className="playlist-actions-edit">
              <Edit2 size={20} />
            </button>
            <button
              className="playlist-actions-remove"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}

        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Удаление плейлиста"
          message="Вы действительно хотите удалить этот плейлист?"
        />
      </div>
    </div>
  );
};
