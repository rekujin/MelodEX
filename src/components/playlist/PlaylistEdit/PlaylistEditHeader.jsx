import { ArrowLeft, Music, Calendar, Edit2, X, Check, Plus } from "lucide-react";
import { getPlatformColorClass, getPlatformName } from "../../../helper/formatters";

const PlaylistEditHeader = ({
  currentPlaylist,
  isEditing,
  editedData,
  tags,
  newTag,
  maxTags,
  tagMaxLength,
  onNavigateBack,
  onImageUpload,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditedDataChange,
  onTagAdd,
  onTagRemove,
  onTagInputChange,
}) => {
  return (
    <div className="playlist-header">
      <div className="playlist-header-inner">
        <button onClick={onNavigateBack} className="playlist-back-btn">
          <ArrowLeft size={20} />
          Назад
        </button>

        <div className="playlist-header-content">
          <div className="playlist-avatar-wrapper">
            <div
              className={`playlist-avatar ${
                currentPlaylist.cover ? "has-image" : ""
              }`}
            >
              {currentPlaylist.cover ? (
                <img
                  src={
                    typeof currentPlaylist.cover === "string" &&
                    currentPlaylist.cover.startsWith("http")
                      ? currentPlaylist.cover
                      : currentPlaylist.cover
                  }
                  alt="Обложка плейлиста"
                  className="playlist-avatar-image"
                />
              ) : (
                <Music size={64} className="playlist-avatar-icon" />
              )}
            </div>
            <label className="playlist-avatar-edit">
              <Edit2 size={20} />
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="hidden"
              />
            </label>
          </div>

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

            {isEditing ? (
              <div className="playlist-edit-container">
                <input
                  type="text"
                  value={editedData.title}
                  onChange={(e) =>
                    onEditedDataChange({ ...editedData, title: e.target.value })
                  }
                  className="playlist-title-input"
                  placeholder="Название плейлиста"
                />
                <textarea
                  value={editedData.description}
                  onChange={(e) =>
                    onEditedDataChange({
                      ...editedData,
                      description: e.target.value,
                    })
                  }
                  className="playlist-description-input"
                  placeholder="Добавьте описание..."
                />
                <div className="playlist-edit-buttons">
                  <button
                    onClick={onEditSave}
                    className="playlist-edit-save-btn"
                  >
                    <Check size={16} />
                    Сохранить
                  </button>
                  <button
                    onClick={onEditCancel}
                    className="playlist-edit-cancel-btn"
                  >
                    <X size={16} />
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="playlist-title">
                  {currentPlaylist.title}
                  <button onClick={onEditStart} className="edit-button">
                    <Edit2 size={16} />
                  </button>
                </h1>
                <p className="playlist-desc">{currentPlaylist.description}</p>
              </>
            )}

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
        
        {/* Теги внутри header-content */}
        <div className="playlist-tags-container">
          {tags.map((tag) => (
            <span key={tag} className="playlist-tag">
              {tag}
              <button
                onClick={() => onTagRemove(tag)}
                className="playlist-tag-remove"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {tags.length < maxTags && (
            <div className="playlist-tag-input-container">
              <input
                type="text"
                value={newTag}
                onChange={onTagInputChange}
                placeholder="Добавить тег"
                className="playlist-tag-input"
                maxLength={tagMaxLength}
              />
              <button
                onClick={onTagAdd}
                className="playlist-tag-add"
                disabled={!newTag.trim()}
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistEditHeader;