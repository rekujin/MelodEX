import { useState, useEffect } from "react";
import { ArrowLeft, Music, Clock, Calendar, User, Album } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import supabase from "../helper/supabaseClient";
import "./CreatePlaylist.css";

const CreatePlaylist = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const importedPlaylist = location.state?.playlistData;
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (importedPlaylist) {
      setCurrentPlaylist(importedPlaylist);
    } else {
      setCurrentPlaylist({
        title: "None",
        trackCount: 0,
        platform: "platform-default",
        tracks: [],
      });
    }
  }, [importedPlaylist]);

  useEffect(() => {
    if (!importedPlaylist) {
      navigate("/", { replace: true });
    }
  }, [importedPlaylist, navigate]);

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ru-RU");
  };

  const getPlatformColorClass = (platform) => {
    const colors = {
      yandex: "platform-yandex",
      spotify: "platform-spotify",
      soundcloud: "platform-soundcloud",
    };
    return colors[platform] || "platform-default";
  };

  const getPlatformName = (platform) => {
    const names = {
      yandex: "Яндекс.Музыка",
      spotify: "Spotify",
      soundcloud: "SoundCloud",
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
          <button onClick={() => navigate(-1)} className="playlist-back-btn">
            <ArrowLeft size={20} />
            Назад
          </button>

          <div className="playlist-header-content">
            {/* Аватар плейлиста */}
            <div className={`playlist-avatar ${currentPlaylist.cover ? 'has-image' : ''}`}>
              {currentPlaylist.cover ? (
                <img
                  src={currentPlaylist.cover.replace("%%", "200x200")}
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
                <span
                  className={`playlist-platform-label ${getPlatformColorClass(
                    currentPlaylist.platform
                  )}`}
                >
                  {getPlatformName(currentPlaylist.platform)}
                </span>
              </div>

              <h1 className="playlist-title">{currentPlaylist.title}</h1>

              <p className="playlist-desc">{currentPlaylist.description}</p>

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
                {currentPlaylist.tracks?.map((item, index) => (
                  <tr key={item.track.id} className="playlist-table-row">
                    <td>{index + 1}</td>
                    <td>
                      <div className={`playlist-track-cover ${item.track.cover ? 'has-image' : ''}`}>
                        {item.track.cover ? (
                          <img
                            src={item.track.cover.replace("%%", "200x200")}
                            alt="Обложка трека"
                            className="playlist-track-avatar-image"
                          />
                        ) : (
                          <Music
                            size={16}
                            className="playlist-track-cover-icon"
                          />
                        )}
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
                        <span>
                          {item.track.artists
                            ?.map((artist) => artist.name)
                            .join(", ")}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="playlist-track-album">
                        <Album size={14} />
                        <span>{item.track.albums?.[0]?.title || "-"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="playlist-track-date">
                        <Calendar size={14} />
                        <span>{formatDate(new Date())}</span>
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
            disabled={isSaving}
          >
            Отмена
          </button>
          <button
            className="playlist-save-btn"
            disabled={isSaving}
            onClick={async () => {
              if (!currentPlaylist) return;
              setIsSaving(true);

              try {
                if (!user) {
                  alert("Вы не авторизованы");
                  return;
                }

                const { title, description, platform, tracks } =
                  currentPlaylist;

                // Шаг 1: Создаём плейлист
                const { data: playlist, error: playlistError } = await supabase
                  .from("playlists")
                  .insert({
                    title,
                    description: description || "",
                    author_id: user.id,
                    platform,
                    avatar_url: currentPlaylist.cover || null,
                  })
                  .select()
                  .single();

                if (playlistError || !playlist) {
                  throw new Error("Ошибка при создании плейлиста");
                }

                // Шаг 2: Параллельное сохранение треков
                const trackPromises = tracks.map(async (trackItem, index) => {
                  const track = trackItem.track;

                  // Поиск существующего трека
                  const { data: existingTrack } = await supabase
                    .from("tracks")
                    .select("id")
                    .eq("title", track.title)
                    .eq("artist", track.artists[0]?.name || "")
                    .maybeSingle();

                  let trackId = existingTrack?.id;

                  if (!trackId) {
                    // Создание нового трека
                    const { data: insertedTrack, error: trackInsertError } =
                      await supabase
                        .from("tracks")
                        .insert({
                          title: track.title,
                          artist: track.artists[0]?.name || "Unknown Artist",
                          album: track.albums?.[0]?.title || null,
                          duration: Math.floor(track.durationMs / 1000),
                          artwork_url: track.cover || null,
                          platform,
                        })
                        .select()
                        .single();

                    if (trackInsertError || !insertedTrack) {
                      throw new Error(
                        `Ошибка при сохранении трека: ${track.title}`
                      );
                    }

                    trackId = insertedTrack.id;
                  }

                  // Связывание трека с плейлистом
                  return supabase.from("playlist_tracks").insert({
                    playlist_id: playlist.id,
                    track_id: trackId,
                    position: index + 1,
                  });
                });

                await Promise.all(trackPromises);
                navigate("/playlists");
              } catch (error) {
                console.error(error);
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
      {isSaving && (
        <div className="playlist-saving-overlay">
          <div className="playlist-spinner"></div>
          <p>Сохранение плейлиста...</p>
        </div>
      )}
    </div>
  );
};

export default CreatePlaylist;
