import { useState, useEffect } from "react";

export const usePlaylistEditing = (initialPlaylist) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    title: "",
    description: "",
  });

  // Синхронизируем editedData с изменениями в initialPlaylist
  useEffect(() => {
    if (initialPlaylist && !isEditing) {
      setEditedData({
        title: initialPlaylist.title || "",
        description: initialPlaylist.description || "",
      });
    }
  }, [initialPlaylist, isEditing]);

  const handleEditStart = () => {
    setIsEditing(true);
    setEditedData({
      title: initialPlaylist?.title || "",
      description: initialPlaylist?.description || "",
    });
  };

  const handleEditSave = (onSave) => {
    if (onSave) {
      onSave(editedData);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditedData({
      title: initialPlaylist?.title || "",
      description: initialPlaylist?.description || "",
    });
    setIsEditing(false);
  };

  const handleEditedDataChange = (newData) => {
    setEditedData(newData);
  };

  return {
    isEditing,
    editedData,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleEditedDataChange,
  };
};
