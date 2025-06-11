import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { playlistsApi } from "../../api/playlists";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useToast } from "../../context/ToastContext";

// Components
import PlaylistEditHeader from "../../components/playlist/PlaylistEdit/PlaylistEditHeader";
import PlaylistEditTracks from "../../components/playlist/PlaylistEdit/PlaylistEditTracks";
import PlaylistActions from "../../components/playlist/PlaylistEdit/PlaylisActions";
import SavingOverlay from "../../components/playlist/PlaylistEdit/SavingOverlay";

// Hooks
import { usePlaylistTags } from "../../hooks/usePlaylistTags";
import { usePlaylistEditing } from "../../hooks/usePlaylistEditing";
import { useAuth } from "../../hooks/useAuth";
import { useFormValidation } from "../../hooks/useFormValidation";

// Styles
import "./CreatePlaylist.css";

const CreatePlaylist = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const importedPlaylist = location.state?.playlistData;

  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Константы
  const MAX_TAGS = 8;
  const TAG_MAX_LENGTH = 24;

  // Хуки для тегов и редактирования
  const {
    tags,
    newTag,
    setTags,
    handleTagAdd,
    handleTagInputChange,
    handleTagRemove,
  } = usePlaylistTags(MAX_TAGS, TAG_MAX_LENGTH);

  const {
    isEditing,
    editedData,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleEditedDataChange,
  } = usePlaylistEditing(currentPlaylist);

  // Инициализация плейлиста
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

  // Редирект если нет импортированного плейлиста
  useEffect(() => {
    if (!importedPlaylist) {
      navigate("/", { replace: true });
    }
  }, [importedPlaylist, navigate]);

  // Валидация формы
  const { values, errors, handleChange, validateForm } = useFormValidation(
    {
      title: currentPlaylist?.title || "",
      description: currentPlaylist?.description || "",
    },
    {
      title: (value) => (!value ? "Название обязательно" : null),
    }
  );

  // Обработчики
  const handlePlaylistEditSave = (newData) => {
    setCurrentPlaylist({
      ...currentPlaylist,
      title: newData.title,
      description: newData.description,
    });
  };

  const handleTrackRemove = (index) => {
    const newTracks = [...currentPlaylist.tracks];
    newTracks.splice(index, 1);
    setCurrentPlaylist({
      ...currentPlaylist,
      tracks: newTracks,
      trackCount: newTracks.length,
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentPlaylist({
        ...currentPlaylist,
        cover: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSavePlaylist = async () => {
    if (!currentPlaylist.title || currentPlaylist.title.trim() === "") {
      showToast("Название обязательно", "error");
      return;
    }

    if (!currentPlaylist.tracks || currentPlaylist.tracks.length === 0) {
      showToast("В вашем плейлисе отсутствуют треки", "error");
      navigate("/");
      return;
    }

    setIsSaving(true);

    try {
      if (!user) throw new Error("Вы не авторизованы");

      await playlistsApi.createPlaylist(
        {
          ...currentPlaylist,
          title: currentPlaylist.title,
          description: currentPlaylist.description,
          cover: currentPlaylist.cover,
          tags,
        },
        user.id
      );

      showToast("Плейлист успешно создан", "success");
      navigate("/playlists");
    } catch (error) {
      console.error(error);
      showToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigateBack = () => navigate(-1);

  if (!currentPlaylist) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="playlist-root">
      <PlaylistEditHeader
        currentPlaylist={currentPlaylist}
        isEditing={isEditing}
        editedData={editedData}
        tags={tags}
        newTag={newTag}
        maxTags={MAX_TAGS}
        tagMaxLength={TAG_MAX_LENGTH}
        onNavigateBack={handleNavigateBack}
        onImageUpload={handleImageUpload}
        onEditStart={handleEditStart}
        onEditSave={() => handleEditSave(handlePlaylistEditSave)}
        onEditCancel={handleEditCancel}
        onEditedDataChange={handleEditedDataChange}
        onTagAdd={handleTagAdd}
        onTagRemove={handleTagRemove}
        onTagInputChange={handleTagInputChange}
      />

      <PlaylistEditTracks
        tracks={currentPlaylist.tracks}
        onTrackRemove={handleTrackRemove}
      />

      <PlaylistActions
        isSaving={isSaving}
        onCancel={handleNavigateBack}
        onSave={handleSavePlaylist}
      />

      <SavingOverlay isVisible={isSaving} />
    </div>
  );
};

export default CreatePlaylist;
