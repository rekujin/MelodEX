import { useState, useEffect } from 'react';
import { ArrowLeft, Music, Clock, Calendar, User, Album } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CreatePlaylist.css';

const CreatePlaylist = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const importedPlaylist = location.state?.playlistData;

  const [currentPlaylist, setCurrentPlaylist] = useState(null);

  useEffect(() => {
    if (importedPlaylist) {
      setCurrentPlaylist(importedPlaylist);
    } else {
      setCurrentPlaylist({
        title: "My Awesome Playlist",
        trackCount: 25,
        platform: "spotify",
        tracks: [
          {
            track: {
              id: "1",
              title: "Bohemian Rhapsody",
              artists: [{ name: "Queen" }],
              albums: [{ title: "A Night at the Opera" }],
              durationMs: 355000
            }
          },
          {
            track: {
              id: "2", 
              title: "Stairway to Heaven",
              artists: [{ name: "Led Zeppelin" }],
              albums: [{ title: "Led Zeppelin IV" }],
              durationMs: 480000
            }
          },
          {
            track: {
              id: "3",
              title: "Hotel California",
              artists: [{ name: "Eagles" }],
              albums: [{ title: "Hotel California" }],
              durationMs: 391000
            }
          }
        ]
      });
    }
  }, [importedPlaylist]);

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const getPlatformColorClass = (platform) => {
    const colors = {
      yandex: 'platform-yandex',
      spotify: 'platform-spotify',
      soundcloud: 'platform-soundcloud'
    };
    return colors[platform] || 'platform-default';
  };

  const getPlatformName = (platform) => {
    const names = {
      yandex: 'Яндекс.Музыка',
      spotify: 'Spotify',
      soundcloud: 'SoundCloud'
    };
    return names[platform] || platform;
  };

  if (!currentPlaylist) {
    return (
      <div className="playlist-loading">
        <div className="playlist-spinner"></div>
      </div>
    );
  }

  return (
    <div className="playlist-root">
      {/* Header */}
      <div className="playlist-header">
        <div className="playlist-header-inner">
          <button
            onClick={() => navigate(-1)}
            className="playlist-back-btn"
          >
            <ArrowLeft size={20} />
            Назад
          </button>
          
          <div className="playlist-header-content">
            {/* Аватар плейлиста */}
            <div className="playlist-avatar">
                {currentPlaylist.cover ? (
                <img 
                    src={"https://" + currentPlaylist.cover.replace('%%', '200x200')}
                    alt="Обложка плейлиста"
                    className="playlist-avatar-image"
                />
                ) : (
                <Music size={64} className="playlist-avatar-icon" />
                )}
            </div>
            
            {/* Информация о плейлисте */}
            <div className="playlist-info">
              <div className="playlist-platform-row">
                <span className={`playlist-platform-label ${getPlatformColorClass(currentPlaylist.platform)}`}>
                  {getPlatformName(currentPlaylist.platform)}
                </span>
              </div>
              
              <h1 className="playlist-title">
                {currentPlaylist.title}
              </h1>
              
              <p className="playlist-desc">
                {currentPlaylist.description}
              </p>
              
              <div className="playlist-meta-row">
                <div className="playlist-meta">
                  <Music size={16} />
                  <span>{currentPlaylist.trackCount} треков</span>
                </div>
                <div className="playlist-meta">
                  <Calendar size={16} />
                  <span>Сегодня</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Список треков */}
      <div className="playlist-tracks-container">
        <div className="playlist-tracks-box">
          <div className="playlist-tracks-header">
            <h2 className="playlist-tracks-title">Треки</h2>
          </div>
          
          <div className="playlist-table-wrapper">
            <table className="playlist-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th></th>
                  <th>Название</th>
                  <th>Исполнитель</th>
                  <th>Альбом</th>
                  <th>Дата</th>
                  <th>Длительность</th>
                </tr>
              </thead>
              <tbody>
                {currentPlaylist.tracks?.map((item, index) => (
                  <tr key={item.track.id} className="playlist-table-row">
                    <td>{index + 1}</td>
                    <td>
                      <div className="playlist-track-cover">
                        <Music size={16} className="playlist-track-cover-icon" />
                      </div>
                    </td>
                    <td>
                      <div className="playlist-track-title">
                        {item.track.title}
                      </div>
                    </td>
                    <td>
                      <div className="playlist-track-artist">
                        <User size={14} />
                        {item.track.artists?.map(artist => artist.name).join(', ')}
                      </div>
                    </td>
                    <td>
                      <div className="playlist-track-album">
                        <Album size={14} />
                        {item.track.albums?.[0]?.title || '-'}
                      </div>
                    </td>
                    <td>
                      <div className="playlist-track-date">
                        <Calendar size={14} />
                        {formatDate(new Date())}
                      </div>
                    </td>
                    <td>
                      <div className="playlist-track-duration">
                        <Clock size={14} />
                        {formatDuration(item.track.durationMs)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(!currentPlaylist.tracks || currentPlaylist.tracks.length === 0) && (
            <div className="playlist-empty">
              <Music size={48} className="playlist-empty-icon" />
              <p className="playlist-empty-text">Треки не найдены</p>
            </div>
          )}
        </div>
        
        {/* Кнопки действий */}
        <div className="playlist-actions">
          <button
            onClick={() => navigate(-1)}
            className="playlist-cancel-btn"
          >
            Отмена
          </button>
          <button
            className="playlist-save-btn"
            onClick={() => {
              // Здесь будет логика сохранения в Supabase
              alert('Плейлист будет сохранен в базу данных');
            }}
          >
            Сохранить плейлист
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylist;