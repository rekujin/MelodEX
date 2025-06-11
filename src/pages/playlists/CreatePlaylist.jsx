import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { playlistsApi } from "../../api/playlists";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useToast } from "../../context/ToastContext";
import supabase from "../../helper/supabaseClient";

// Components
import PlaylistEditHeader from "../../components/playlist/PlaylistEdit/PlaylistEditHeader";
import PlaylistEditTracks from "../../components/playlist/PlaylistEdit/PlaylistEditTracks";
import PlaylistActions from "../../components/playlist/PlaylistEdit/PlaylisActions";
import SavingOverlay from "../../components/playlist/PlaylistEdit/SavingOverlay";

// Hooks
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
  const [tags, setTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  // Константы
  const MAX_TAGS = 8;
  const TAG_MAX_LENGTH = 24;

  useEffect(() => {
    if (importedPlaylist) {
      setCurrentPlaylist({
        ...importedPlaylist,
        id: importedPlaylist.id,
        cover: importedPlaylist.avatar_url,
        trackCount:
          importedPlaylist.track_count || importedPlaylist.tracks?.length || 0,
        tracks: importedPlaylist.tracks || [],
      });
      setTags(importedPlaylist.tags || []);
    } else {
      setCurrentPlaylist({
        title: "None",
        trackCount: 0,
        platform: "platform-default",
        tracks: [],
      });
    }
  }, [importedPlaylist]);

  useEffect(() => {
    if (!importedPlaylist && location.pathname.includes("edit")) {
      navigate("/", { replace: true });
    }
  }, [importedPlaylist, navigate, location]);

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

  const handleImageUpload = ({ file, previewUrl }) => {
    setImageFile(file);
    setCurrentPlaylist({
      ...currentPlaylist,
      cover: previewUrl,
    });
  };

  const uploadPlaylistCover = async () => {
    if (!imageFile) return null;

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; // Добавляем id пользователя как первую часть пути

      const { error: uploadError } = await supabase.storage
        .from("playlist-covers")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("playlist-covers")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Ошибка при загрузке обложки:", error);
      throw new Error("Не удалось загрузить обложку плейлиста");
    }
  };

  const handleSavePlaylist = async () => {
    if (!currentPlaylist.title || currentPlaylist.title.trim() === "") {
      showToast("Название обязательно", "error");
      return;
    }

    if (!currentPlaylist.tracks || currentPlaylist.tracks.length === 0) {
      showToast("В вашем плейлисте отсутствуют треки", "error");
      navigate("/");
      return;
    }

    setIsSaving(true);

    try {
      if (!user) throw new Error("Вы не авторизованы");

      let coverUrl = currentPlaylist.cover;
      if (imageFile) {
        coverUrl = await uploadPlaylistCover();
      }

      const playlistData = {
        ...currentPlaylist,
        title: currentPlaylist.title,
        description: currentPlaylist.description,
        avatar_url: coverUrl,
        track_count: currentPlaylist.trackCount,
        tags,
      };

      if (currentPlaylist.id) {
        await playlistsApi.updatePlaylist(currentPlaylist.id, playlistData);
        showToast("Плейлист успешно обновлен", "success");
      } else {
        await playlistsApi.createPlaylist(playlistData, user.id);
        showToast("Плейлист успешно создан", "success");
      }

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
        tags={tags}
        maxTags={MAX_TAGS}
        tagMaxLength={TAG_MAX_LENGTH}
        onNavigateBack={handleNavigateBack}
        onImageUpload={handleImageUpload}
        onEditSave={handlePlaylistEditSave}
        onTagsChange={setTags}
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
