import { X, Plus } from "lucide-react";

const PlaylistTags = ({
  tags,
  newTag,
  maxTags,
  tagMaxLength,
  onTagAdd,
  onTagRemove,
  onTagInputChange,
}) => {
  return (
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
  );
};

export default PlaylistTags;