import { useState, useEffect } from 'react';
import { Heart, Music, User } from 'lucide-react';
import supabase from "../helper/supabaseClient";
import './PlaylistsPage.css';

const PlaylistsPage = () => {
  const [activeTab, setActiveTab] = useState('created');
  const [createdPlaylists, setCreatedPlaylists] = useState([]);
  const [likedPlaylists, setLikedPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchPlaylists(user.id);
      }
    };
    
    getUser();
  }, []);

  const fetchPlaylists = async (userId) => {
    setLoading(true);
    
    try {
      // Получаем созданные плейлисты
      const { data: created, error: createdError } = await supabase
        .from('playlists')
        .select(`
          id,
          title,
          description,
          avatar_url,
          likes_count,
          track_count,
          total_duration,
          created_at,
          author_id
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (createdError) throw createdError;

      // Получаем понравившиеся плейлисты
      const { data: liked, error: likedError } = await supabase
        .from('playlist_likes')
        .select(`
          created_at,
          playlists:playlist_id (
            id,
            title,
            description,
            avatar_url,
            likes_count,
            track_count,
            total_duration,
            created_at,
            author_id
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (likedError) throw likedError;

      const allPlaylists = [
        ...(created || []),
        ...(liked?.map(item => item.playlists).filter(Boolean) || [])
      ];
      
      const authorIds = [...new Set(allPlaylists.map(p => p.author_id))];
      
      let authorsMap = {};
      if (authorIds.length > 0) {
        const { data: authors, error: authorsError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', authorIds);
          
        if (!authorsError && authors) {
          authorsMap = authors.reduce((acc, author) => {
            acc[author.id] = author;
            return acc;
          }, {});
        }
      }

      const enrichedCreated = (created || []).map(playlist => ({
        ...playlist,
        author: authorsMap[playlist.author_id]
      }));

      const enrichedLiked = (liked?.map(item => item.playlists).filter(Boolean) || []).map(playlist => ({
        ...playlist,
        author: authorsMap[playlist.author_id]
      }));

      setCreatedPlaylists(enrichedCreated);
      setLikedPlaylists(enrichedLiked);
    } catch (error) {
      console.error('Ошибка при загрузке плейлистов:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  const getAuthorName = (playlist) => {
    return playlist.author?.username || 'Неизвестный автор';
  };

  const PlaylistCard = ({ playlist }) => (
    <div className="playlists-card">
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
            <span className="playlists-meta-author">{getAuthorName(playlist)}</span>
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

  const TabContent = ({ playlists }) => {
    if (loading) {
      return (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      );
    }

    if (playlists.length === 0) {
      return (
        <div className="empty-state">
          <Music className="empty-state-icon w-12 h-12" />
          <p>
            {activeTab === 'created' 
              ? 'У вас пока нет созданных плейлистов' 
              : 'У вас пока нет понравившихся плейлистов'}
          </p>
        </div>
      );
    }

    return (
      <div className="playlists-grid">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
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
              onClick={() => setActiveTab('created')}
              className={`playlists-tab ${activeTab === 'created' ? 'active' : ''}`}
            >
              Созданные ({createdPlaylists.length})
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`playlists-tab ${activeTab === 'liked' ? 'active' : ''}`}
            >
              Понравившиеся ({likedPlaylists.length})
            </button>
          </div>
        </div>

        <TabContent 
          playlists={activeTab === 'created' ? createdPlaylists : likedPlaylists} 
        />
      </div>
    </div>
  );
};

export default PlaylistsPage;