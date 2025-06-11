import "./PlaylisActions.css"

const PlaylistActions = ({ isSaving, onCancel, onSave }) => {
  return (
    <div className="playlist-actions">
      <button
        onClick={onCancel}
        className="playlist-cancel-btn"
        disabled={isSaving}
      >
        Отмена
      </button>
      <button
        className="playlist-save-btn"
        disabled={isSaving}
        onClick={onSave}
      >
        {isSaving ? "Сохранение..." : "Сохранить плейлист"}
      </button>
    </div>
  );
};

export default PlaylistActions;