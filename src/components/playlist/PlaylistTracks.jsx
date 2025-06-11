// Icons
import { Music, Clock, Calendar, User, Album } from "lucide-react";

// Helpers
import { formatDate, formatDurationMs } from "../../helper/formatters";

import "./PlaylistTracks.css"

export const PlaylistTracks = ({ tracks }) => {
  return (
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
              {tracks.map((item, index) => (
                <tr key={item.track.id} className="playlist-table-row">
                  <td>{index + 1}</td>
                  <td>
                    <div className={`playlist-track-cover ${item.track.cover ? "has-image" : ""}`}>
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
                      <User size={16} />
                      <span>{item.track.artists[0]?.name || "Неизвестный исполнитель"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="playlist-track-album">
                      <Album size={16} />
                      <span>{item.track.albums[0]?.title || "-"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="playlist-track-date">
                      <Calendar size={16} />
                      <span>{formatDate(item.track.created_at)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="playlist-track-duration">
                      <Clock size={16} />
                      <span>{formatDurationMs(item.track.durationMs)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
