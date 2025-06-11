import { useState } from "react";

// Icons
import { X, Download, CheckCircle, AlertCircle } from "lucide-react";

// Styles
import "./CreateModal.css";

const ImportModal = ({ isOpen, onClose, onImportSuccess = () => {} }) => {
  const [formState, setFormState] = useState({
    platform: "yandex",
    url: "",
    playlistData: null,
    error: "",
  });

  const platforms = [
    { value: "yandex", label: "Яндекс.Музыка" },
    { value: "spotify", label: "Spotify" },
    { value: "soundcloud", label: "SoundCloud" },
  ];

  const handleImport = async () => {
    if (!formState.url.trim()) {
      setFormState((prev) => ({
        ...prev,
        error: "Введите ссылку на плейлист",
      }));
      return;
    }

    setFormState((prev) => ({ ...prev, isLoading: true, error: "" }));

    try {
      const response = await fetch(
        `http://localhost:5000/api/${
          formState.platform
        }/resolve?url=${encodeURIComponent(formState.url)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || data.error || "Ошибка при загрузке плейлиста"
        );
      }

      setFormState({
        platform: "yandex",
        url: "",
        playlistData: {
          ...data.result,
          platform: formState.platform,
          originalUrl: formState.url,
        },
        error: "",
      });
    } catch (err) {
      console.error("Import error:", err);
      setFormState((prev) => ({
        ...prev,
        error: err.message || "Ошибка при загрузке плейлиста",
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleCreate = () => {
    if (formState.playlistData) {
      if (formState.playlistData.trackCount === 0) {
        resetModal();
        onClose();
        return;
      }
      onImportSuccess(formState.playlistData);
      resetModal();
      onClose();
    }
  };

  const resetModal = () => {
    setFormState((prev) => ({
      platform: "yandex",
      url: "",
      playlistData: null,
      error: "",
    }));
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button onClick={handleClose} className="close-button">
            <X size={24} />
          </button>
          <h3>Импорт плейлиста</h3>
        </div>

        <div>
          {!formState.playlistData ? (
            <form
              className="import-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleImport();
              }}
            >
              <div>
                <label className="label">Платформа</label>
                <select
                  value={formState.platform}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      platform: e.target.value,
                    }))
                  }
                  className="input"
                >
                  {platforms.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Ссылка на плейлист</label>
                <input
                  type="url"
                  value={formState.url}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="Вставьте ссылку на плейлист"
                  className="input"
                />
              </div>

              {formState.error && (
                <div className="message error">
                  <AlertCircle />
                  <span>{formState.error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={formState.isLoading || !formState.url.trim()}
                className="import-btn"
              >
                {formState.isLoading ? (
                  <>
                    <div className="loader" />
                    <span className="import-btn-loading-text">Загрузка...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} className="import-btn-icon" />
                    <span>Импортировать</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="playlist-result">
              <div className="playlist-success-row">
                <CheckCircle size={20} className="playlist-success-icon" />
                <span className="playlist-success-text">
                  Плейлист успешно загружен
                </span>
              </div>

              <div className="playlist-preview">
                <h3 className="playlist-preview-title">
                  {formState.playlistData.title}
                </h3>
                <p className="playlist-preview-count">
                  Треков: {formState.playlistData.trackCount}
                </p>
                <div className="playlist-preview-platform-row">
                  <span className="playlist-preview-platform">
                    {
                      platforms.find((p) => p.value === formState.platform)
                        ?.label
                    }
                  </span>
                </div>
              </div>

              <div className="playlist-result-actions">
                <button
                  onClick={() =>
                    setFormState((prev) => ({ ...prev, playlistData: null }))
                  }
                  className="playlist-result-back"
                >
                  Назад
                </button>
                <button
                  onClick={handleCreate}
                  className="playlist-result-create"
                >
                  Создать
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
