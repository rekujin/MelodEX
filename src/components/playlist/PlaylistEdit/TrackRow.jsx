import { Music, User, Album, Calendar, Clock, Trash2 } from "lucide-react";
import { formatDurationMs, formatDate } from "../../../helper/formatters";

import "./TrackRow.css"

const TrackRow = ({ item, index, onRemove }) => {
  const { track } = item;

  return (
    <tr className="playlist-table-row">
      <td>{index + 1}</td>
      <td>
        <div className={`playlist-track-cover ${track.cover ? "has-image" : ""}`}>
          {track.cover ? (
            <img
              src={
                typeof track.cover === "string" && track.cover.startsWith("http")
                  ? track.cover.includes("%%")
                    ? track.cover.replace("%%", "200x200")
                    : track.cover
                  : track.cover
              }
              alt="Обложка трека"
              className="playlist-track-avatar-image"
            />
          ) : (
            <Music size={16} className="playlist-track-cover-icon" />
          )}
        </div>
      </td>
      <td>
        <div className="playlist-track-title">{track.title}</div>
      </td>
      <td>
        <div className="playlist-track-artist">
          <User size={14} />
          <span>
            {track.artists?.map((artist) => artist.name).join(", ")}
          </span>
        </div>
      </td>
      <td>
        <div className="playlist-track-album">
          <Album size={14} />
          <span>{track.albums?.[0]?.title || "-"}</span>
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
          <span>{formatDurationMs(track.durationMs)}</span>
        </div>
      </td>
      <td>
        <button onClick={() => onRemove(index)} className="track-remove">
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
};

export default TrackRow;