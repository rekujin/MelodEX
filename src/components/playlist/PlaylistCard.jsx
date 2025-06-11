import { Heart, Music, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDuration } from '../../helper/formatters';

export const PlaylistCard = ({ playlist }) => {
  const navigate = useNavigate();
  const authorName = playlist.author?.username || 'Неизвестный автор';

  return (
    <div 
      className="playlists-card"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className="playlists-cover">
        {playlist.avatar_url ? (
          <img src={playlist.avatar_url} alt={playlist.title} />
        ) : (
          <Music className="w-12 h-12 text-white" />
        )}
      </div>
      
      <div className="playlists-card-info">
        <h4 className="playlists-card-title">{playlist.title}</h4>
        
        <div className="playlists-card-meta">
          <div className="playlists-meta-item">
            <Heart className="w-4 h-4" />
            <span>{playlist.likes_count || 0}</span>
          </div>
          
          <div className="playlists-meta-item">
            <User className="w-4 h-4" />
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
          {playlist.total_duration && (
            <> • {formatDuration(playlist.total_duration)}</>
          )}
        </div>
      </div>
    </div>
  );
};
