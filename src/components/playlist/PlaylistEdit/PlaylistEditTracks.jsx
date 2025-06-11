import { Music } from "lucide-react";
import TrackRow from "./TrackRow";

import "./PlaylistEditTracks.css"

const PlaylistEditTracks = ({ tracks, onTrackRemove }) => {
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tracks?.map((item, index) => (
                <TrackRow
                  key={item.track.id}
                  item={item}
                  index={index}
                  onRemove={onTrackRemove}
                />
              ))}
            </tbody>
          </table>
        </div>

        {(!tracks || tracks.length === 0) && (
          <div className="playlist-empty">
            <Music size={48} className="playlist-empty-icon" />
            <p className="playlist-empty-text">Треки не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistEditTracks;