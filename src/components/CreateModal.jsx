import { useState } from 'react'
import './CreateModal.css'
import YandexLogo from '../assets/icon-yandexm-logo.svg'
import SpotifyLogo from '../assets/icon-spotify-logo.svg'
import supabase from '../helper/supabaseClient'

function CreateModal({ isOpen, onClose, currentUser }) {
  const [platform, setPlatform] = useState('yandex')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [playlistData, setPlaylistData] = useState(null)
  const [error, setError] = useState(null)
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const parseYandexUrl = (url) => {
    const match = url.match(/music\.yandex\.ru\/users\/([^/]+)\/playlists\/(\d+)/)
    return match ? { username: match[1], kind: match[2] } : null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!link.trim()) {
      setError('Пожалуйста, введите ссылку')
      return
    }

    setLoading(true)
    setError(null)
    setPlaylistData(null)

    try {
      if (platform === 'yandex') {
        const parsed = parseYandexUrl(link.trim())
        if (!parsed) {
          throw new Error('Некорректная ссылка на плейлист')
        }

        const response = await fetch(
          `http://localhost:5000/api/users/${parsed.username}/playlists/${parsed.kind}`
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error?.message || 'Ошибка получения плейлиста')
        }

        if (!data.result) {
          throw new Error('Плейлист не найден')
        }

        setPlaylistData({
          title: data.result.title || 'Без названия',
          trackCount: data.result.trackCount || 0,
          tracks: (data.result.tracks || [])
            .map(({ track }) => track && {
              id: track.id,
              title: track.title,
              artist: track.artists?.map(a => a.name).join(', ') || 'Неизвестный исполнитель',
              duration: Math.floor((track.durationMs || 0) / 1000),
              album: track.albums?.[0]?.title
            })
            .filter(Boolean)
        })
      } else {
        throw new Error('Поддержка Spotify пока не реализована')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  // НЕ РАБОТАЕТ
  // const handleSavePlaylist = async () => {
  //   if (!currentUser) {
  //     setError('Пользователь не авторизован')
  //     return
  //   }

  //   if (!playlistData) {
  //     setError('Нет данных плейлиста для сохранения')
  //     return
  //   }

  //   setSaving(true)
  //   setError(null)

  //   try {
  //     const { data: profile, error: profileError } = await supabase
  //       .from('profiles')
  //       .select('username')
  //       .eq('id', currentUser.id)
  //       .single();

  //     if (profileError || !profile) throw new Error('Профиль пользователя не найден');

  //     const { data: playlist, error: playlistError } = await supabase
  //       .from('playlists')
  //       .insert([{
  //         title: playlistData.title,
  //         user_id: currentUser.id,
  //         author_username: profile.username,
  //         track_count: playlistData.trackCount,
  //         service: platform,
  //         service_id: parseYandexUrl(link)?.kind
  //       }])
  //       .select('id')
  //       .single()

  //     if (playlistError) throw playlistError

  //     const tracksToInsert = playlistData.tracks.map(track => ({
  //       playlist_id: playlist.id,
  //       title: track.title,
  //       artist: track.artist,
  //       duration: track.duration,
  //       album: track.album || null,
  //       service_track_id: track.id,
  //       user_id: currentUser.id
  //     }))

  //     const { error: tracksError } = await supabase
  //       .from('tracks')
  //       .insert(tracksToInsert)

  //     if (tracksError) throw tracksError

  //     alert(`Плейлист "${playlistData.title}" успешно создан для @${profile.username}!`)
  //     handleClose()

  //   } catch (err) {
  //     setError(`Ошибка сохранения: ${err.message}`)
  //   } finally {
  //     setSaving(false)
  //   }
  // }

  const handleClose = () => {
    setLink('')
    setPlaylistData(null)
    setError(null)
    setLoading(false)
    onClose()
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setMouseDownOnOverlay(true)
        }
      }}
      onMouseUp={(e) => {
        if (e.target === e.currentTarget && mouseDownOnOverlay) {
          handleClose()
        }
        setMouseDownOnOverlay(false)
      }}
    >
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        onMouseDown={() => setMouseDownOnOverlay(false)}
      >
        <div className="modal-header">
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>
        
        <div className="platform-toggle">
          <button 
            className={platform === 'yandex' ? 'active' : ''} 
            onClick={() => setPlatform('yandex')}
            disabled={loading}
          >
            <img src={YandexLogo} alt="Yandex Music" className="service-icon" />
            Я.Музыка
          </button>
          <button 
            className={platform === 'spotify' ? 'active' : ''} 
            onClick={() => setPlatform('spotify')}
            disabled={loading}
          >
            <img src={SpotifyLogo} alt="Spotify" className="service-icon" />
            Spotify
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Вставьте ссылку..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !link.trim()}>
            {loading ? 'Загрузка...' : 'Создать'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <p>Ошибка: {error}</p>
          </div>
        )}

        {playlistData && (
          <div className="playlist-result">
            <h3>{playlistData.title}</h3>
            <p>Количество треков: {playlistData.trackCount}</p>
            
            {playlistData.tracks && playlistData.tracks.length > 0 && (
              <div className="tracks-list">
                <h4>Треки:</h4>
                <div className="tracks-container">
                  {playlistData.tracks.map((track, index) => (
                    <div key={track.id || index} className="track-item">
                      <div className="track-number">{index + 1}</div>
                      <div className="track-info">
                        <div className="track-title">{track.title}</div>
                        <div className="track-artist">{track.artist}</div>
                      </div>
                      {track.duration > 0 && (
                        <div className="track-duration">
                          {formatDuration(track.duration)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="save-actions">
              <button 
                onClick={handleSavePlaylist}
                disabled={saving}
                className="save-button"
              >
                {saving ? 'Сохранение...' : 'Сохранить плейлист'}
              </button>
            </div>    
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateModal