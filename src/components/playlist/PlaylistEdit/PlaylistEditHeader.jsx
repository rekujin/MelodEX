import {
  ArrowLeft,
  Music,
  Calendar,
  Edit2,
  X,
  Check,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getPlatformColorClass,
  getPlatformName,
} from "../../../helper/formatters";

import "./PlaylistEditHeader.css";
import "../PlaylistHeader.css";

const PlaylistEditHeader = ({
  currentPlaylist,
  tags: initialTags = [],
  maxTags,
  tagMaxLength,
  onNavigateBack,
  onImageUpload,
  onEditSave,
  onTagsChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [editedData, setEditedData] = useState({
    title: currentPlaylist.title || "",
    description: currentPlaylist.description || "",
  });
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState("");

  const handleEditStart = () => {
    setIsEditing(true);
    setEditedData({
      title: currentPlaylist.title || "",
      description: currentPlaylist.description || "",
    });
  };

    const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Файл слишком большой. Максимальный размер 2MB");
      }

      // Создаем превью для отображения
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload({
          file,
          previewUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Ошибка при загрузке картинки:", error);
      // Здесь можно добавить отображение ошибки пользователю
    }
  };

  const handleEditCancel = () => {
    setEditedData({
      title: currentPlaylist.title || "",
      description: currentPlaylist.description || "",
    });
    setIsEditing(false);
  };

  const handleSave = () => {
    onEditSave(editedData);
    setIsEditing(false);
  };

  const handleTagAdd = () => {
    const trimmedTag = newTag?.trim();
    if (trimmedTag && tags.length < maxTags) {
      const updatedTags = [...tags, trimmedTag];
      setTags(updatedTags);
      setNewTag("");
      requestAnimationFrame(() => {
        onTagsChange(updatedTags);
      });
    }
  };

  const handleTagRemove = (tagToRemove) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    requestAnimationFrame(() => {
      onTagsChange(updatedTags);
    });
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value || "";
    if (value.length <= tagMaxLength) {
      setNewTag(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newTag?.trim()) {
      e.preventDefault();
      handleTagAdd();
    }
  };

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
                onChange={handleImageUpload}
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
                    setEditedData(prev => ({
                      ...prev,
                      title: e.target.value
                    }))
                  }
                  className="playlist-title-input"
                  placeholder="Название плейлиста"
                />
                <textarea
                  value={editedData.description}
                  onChange={(e) =>
                    setEditedData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))
                  }
                  className="playlist-description-input"
                  placeholder="Добавьте описание..."
                />
                <div className="playlist-edit-buttons">
                  <button
                    onClick={handleSave}
                    className="playlist-edit-save-btn"
                  >
                    <Check size={16} />
                    Сохранить
                  </button>
                  <button
                    onClick={handleEditCancel}
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
                  <span className="playlist-title-text">
                    {currentPlaylist.title}
                  </span>
                  <button onClick={handleEditStart} className="edit-button">
                    <Edit2 size={16} />
                  </button>
                </h1>
                <p className={`playlist-desc ${isDescriptionExpanded ? "expanded" : ""}`}>
                  {currentPlaylist.description}
                </p>
                {currentPlaylist.description?.length > 100 && (
                  <button 
                    className="playlist-desc-button"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  >
                    {isDescriptionExpanded ? "Свернуть" : "Показать"}
                  </button>
                )}
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

        <div className="playlist-tags-container">
          {tags.map((tag) => (
            <span key={tag} className="playlist-tag">
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
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
                onChange={handleTagInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Добавить тег"
                className="playlist-tag-input"
                maxLength={tagMaxLength}
              />
              <button
                onClick={handleTagAdd}
                className="playlist-tag-add"
                disabled={!newTag?.trim()}
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
