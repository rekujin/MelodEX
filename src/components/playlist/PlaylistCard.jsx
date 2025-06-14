import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Music, User } from "lucide-react";
import { playlistsApi } from "../../api/playlists";

import "../../pages/playlists/Playlists.css";

export const PlaylistCard = ({ playlist, onLikeToggle }) => {
  const navigate = useNavigate();
  const authorName = playlist.author?.username || "Неизвестный автор";
  const [likesCount, setLikesCount] = useState(playlist.likes_count || 0);
  const [isLiked, setIsLiked] = useState(playlist.is_liked || false);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  // ДОБАВЛЕНО: Синхронизация с пропсами
  useEffect(() => {
    setLikesCount(playlist.likes_count || 0);
    setIsLiked(playlist.is_liked || false);
  }, [playlist.likes_count, playlist.is_liked]);

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (isLikeProcessing) return;

    const originalLikesCount = likesCount;
    const originalIsLiked = isLiked;

    // Оптимистичное обновление
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    setIsLiked(!isLiked);
    setIsLikeProcessing(true);

    try {
      const result = await playlistsApi.togglePlaylistLike(playlist.id);
      setLikesCount(result.likes_count);
      setIsLiked(result.is_liked);

      if (onLikeToggle) {
        onLikeToggle({
          ...playlist,
          likes_count: result.likes_count,
          is_liked: result.is_liked,
        });
      }

    } catch (error) {
      setLikesCount(originalLikesCount);
      setIsLiked(originalIsLiked);
    } finally {
      setIsLikeProcessing(false);
    }
  };

  return (
    <div
      className="playlists-card"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className="playlists-cover">
        {playlist.avatar_url ? (
          <img src={playlist.avatar_url} alt={playlist.title} />
        ) : (
          <Music className="playlist-avatar-fallback" />
        )}
      </div>

      <div className="playlists-card-info">
        <h4 className="playlists-card-title">{playlist.title}</h4>

        <div className="playlists-card-meta">
          <div className="playlists-meta-item">
            <Heart
              className={`playlist-heart-icon ${isLiked ? "is-liked" : ""}`}
              onClick={handleLikeClick}
            />
            <span>{likesCount}</span>
          </div>

          <div className="playlists-meta-item">
            <User className="playlist-user-icon" />
            <span
              className="playlists-meta-author"
              onClick={(e) => {
                e.stopPropagation();
                if (playlist.author?.username) {
                  navigate(`/user/${playlist.author.username}`);
                }
              }}
            >
              {authorName}
            </span>
          </div>
        </div>

        <div className="playlists-card-stats">
          {playlist.track_count || 0} треков
        </div>
      </div>
    </div>
  );
};