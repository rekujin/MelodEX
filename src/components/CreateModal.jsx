import { useState } from 'react';
import { X, Download, CheckCircle } from 'lucide-react';
import './CreateModal.css';

const ImportModal = ({ isOpen, onClose, onImportSuccess = () => {} }) => {
  const [platform, setPlatform] = useState('yandex');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playlistData, setPlaylistData] = useState(null);
  const [error, setError] = useState('');

  const platforms = [
    { value: 'yandex', label: 'Яндекс.Музыка' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'soundcloud', label: 'SoundCloud' }
  ];

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Введите ссылку на плейлист');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/${platform}/resolve?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'Ошибка при загрузке плейлиста');
      }

      setPlaylistData({
        ...data.result,
        platform,
        originalUrl: url
      });
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Ошибка при загрузке плейлиста');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    if (playlistData) {
      onImportSuccess(playlistData);
      onClose();
    }
  };

  const resetModal = () => {
    setUrl('');
    setPlaylistData(null);
    setError('');
    setPlatform('yandex');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <button
            onClick={handleClose}
            className="close-button"
          >
            <X size={24} />
          </button>
          <h3>
            Импорт плейлиста
          </h3>
        </div>

        <div>
          {!playlistData ? (
            // Форма импорта
            <form
              className="import-form"
              onSubmit={e => {
                e.preventDefault();
                handleImport();
              }}
            >
              {/* Селектор платформы */}
              <div>
                <label className="label">
                  Платформа
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="input"
                >
                  {platforms.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Инпут ссылки */}
              <div>
                <label className="label">
                  Ссылка на плейлист
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Вставьте ссылку на плейлист"
                  className="input"
                />
              </div>

              {/* Ошибка */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* Кнопка импорта */}
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="import-btn"
              >
                {isLoading ? (
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
            // Превью данных
            <div className="playlist-result">
              <div className="playlist-success-row">
                <CheckCircle size={20} className="playlist-success-icon" />
                <span className="playlist-success-text">Плейлист успешно загружен</span>
              </div>

              <div className="playlist-preview">
                <h3 className="playlist-preview-title">
                  {playlistData.title}
                </h3>
                <p className="playlist-preview-count">
                  Треков: {playlistData.trackCount}
                </p>
                <div className="playlist-preview-platform-row">
                  <span className="playlist-preview-platform">
                    {platforms.find(p => p.value === platform)?.label}
                  </span>
                </div>
              </div>

              <div className="playlist-result-actions">
                <button
                  onClick={() => setPlaylistData(null)}
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