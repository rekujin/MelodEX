export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60); 
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  return `${minutes}м`;
};

export const formatDurationMs = (ms) => {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("ru-RU");
};

export const getPlatformColorClass = (platform) => {
  const colors = {
    yandex: "platform-yandex",
    spotify: "platform-spotify",
    soundcloud: "platform-soundcloud",
  };
  return colors[platform] || "platform-default";
};

export const getPlatformName = (platform) => {
  const names = {
    yandex: "Яндекс.Музыка",
    spotify: "Spotify",
    soundcloud: "SoundCloud",
  };
  return names[platform] || platform;
};