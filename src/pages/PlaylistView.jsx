import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, Clock, Calendar, User, Album, ArrowLeft } from 'lucide-react';
import supabase from "../helper/supabaseClient";
import './PlaylistLibrary.css';

const PlaylistView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const { data: playlistData, error: playlistError } = await supabase
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
          .eq('id', id)
          .single();

        if (playlistError) throw playlistError;
        if (!playlistData) throw new Error('Плейлист не найден');

        let authorData = { username: 'Неизвестный пользователь', avatar_url: null };
        
        if (playlistData.author_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', playlistData.author_id)
            .single();

          if (!profileError && profileData) {
            authorData = profileData;
          } else {
            console.log('Не удалось получить данные автора:', profileError);
          }
        }

        const { data: tracksData, error: tracksError } = await supabase
          .from('playlist_tracks')
          .select(`
            position,
            tracks (*)
          `)
          .eq('playlist_id', id)
          .order('position');

        if (tracksError) throw tracksError;

        // Комбинируем данные
        const fullPlaylist = {
          ...playlistData,
          author: authorData,
          tracks: tracksData?.map(item => ({
            track: {
              ...item.tracks,
              cover: item.tracks.artwork_url,
              durationMs: item.tracks.duration * 1000,
              artists: [{ name: item.tracks.artist }],
              albums: item.tracks.album ? [{ title: item.tracks.album }] : []
            }
          })) || []
        };

        setPlaylist(fullPlaylist);
      } catch (err) {
        console.error('Ошибка при загрузке плейлиста:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="error-container">
        <p>{error || 'Плейлист не найден'}</p>
      </div>
    );
  }

  return (
    <div className="playlist-root">
      <div className="playlist-header">
        <div className="playlist-header-inner">
          <button onClick={() => navigate(-1)} className="playlist-back-btn">
            <ArrowLeft size={20} />
            Назад
          </button>

          <div className="playlist-header-content">
            <div className="playlist-avatar-wrapper">
              <div className={`playlist-avatar ${playlist.avatar_url ? 'has-image' : ''}`}>
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
                  <span>{playlist.author?.username || 'Неизвестный пользователь'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="playlist-tracks-container">
        <div className="playlist-tracks-box">
          <div className="playlist-tracks-header">
            <h2 className="playlist-tracks-title">Треки</h2>
          </div>

          <div className="playlist-table-wrapper">
            <table className="playlist-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th></th>
                  <th>Название</th>
                  <th>Исполнитель</th>
                  <th>Альбом</th>
                  <th>Дата</th>
                  <th>Длительность</th>
                </tr>
              </thead>
              <tbody>
                {playlist.tracks.map((item, index) => (
                  <tr key={item.track.id} className="playlist-table-row">
                    <td>{index + 1}</td>
                    <td>
                      <div className={`playlist-track-cover ${item.track.cover ? 'has-image' : ''}`}>
                        {item.track.cover ? (
                          <img
                            src={item.track.cover}
                            alt="Обложка трека"
                            className="playlist-track-avatar-image"
                          />
                        ) : (
                          <Music size={16} className="playlist-track-cover-icon" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="playlist-track-title">{item.track.title}</div>
                    </td>
                    <td>
                      <div className="playlist-track-artist">
                        <User size={14} />
                        <span>{item.track.artists[0]?.name || 'Неизвестный исполнитель'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="playlist-track-album">
                        <Album size={14} />
                        <span>{item.track.albums[0]?.title || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="playlist-track-date">
                        <Calendar size={14} />
                        <span>{formatDate(playlist.created_at)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="playlist-track-duration">
                        <Clock size={14} />
                        <span>{formatDuration(item.track.durationMs)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;