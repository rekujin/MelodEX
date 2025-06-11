const SavingOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="playlist-saving-overlay">
      <div className="playlist-spinner"></div>
      <p>Сохранение плейлиста...</p>
    </div>
  );
};

export default SavingOverlay;