import { useState, useCallback } from "react";

export const usePlaylistTags = (maxTags = 8, tagMaxLength = 24) => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  const handleTagAdd = useCallback(() => {
    let tag = newTag.trim();
    if (!tag) return;
    if (!tag.startsWith("#")) tag = "#" + tag;
    if (tags.length < maxTags && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
      setNewTag("");
    }
  }, [newTag, tags, maxTags]);

  const handleTagInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (value.length <= tagMaxLength) {
        setNewTag(value);
        // Если последний символ Enter - добавляем тег
        if (value.endsWith("\n")) {
          e.preventDefault();
          let tagValue = value.slice(0, -1); // убираем \n
          setNewTag("");
          if (!tagValue.trim()) return;
          if (!tagValue.startsWith("#")) {
            tagValue = "#" + tagValue;
          }
          if (tags.length < maxTags && !tags.includes(tagValue)) {
            setTags((prev) => [...prev, tagValue]);
          }
        }
      }
    },
    [tags, maxTags, tagMaxLength]
  );

  const handleTagRemove = useCallback((tagToRemove) => {
    setTags(prevTags => prevTags.filter((tag) => tag !== tagToRemove));
  }, []);

  return {
    tags,
    newTag,
    setTags,
    handleTagAdd,
    handleTagInputChange,
    handleTagRemove,
  };
};
