import React, { useState, useEffect } from 'react';
import { Home, Music, Search, Disc, Headphones, Heart, Clock, User } from 'lucide-react';
import './NotFoundPage.css'

const NotFoundPage = () => {
  const [vinylSpeed, setVinylSpeed] = useState('8s');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleVinylClick = () => {
    setVinylSpeed('2s');
    setTimeout(() => {
      setVinylSpeed('8s');
    }, 4000);
  };

  const handleNavigation = (path) => {
    // Замените на ваш роутинг
    window.location.href = path;
  };


  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className={`not-found-card ${isVisible ? 'visible' : ''}`}>
          
          {/* Основной контент */}
          <div className="not-found-header">
            <div className="error-section">
              <div className="error-code">404</div>
              <div 
                className="vinyl-container"
                onClick={handleVinylClick}
                style={{ '--vinyl-speed': vinylSpeed }}
              >
                <div className="vinyl">
                  <Disc className="vinyl-icon" />
                </div>
              </div>
            </div>
            
            <h1 className="not-found-title">Страница не найдена</h1>
            <p className="not-found-subtitle">
              Похоже, эта страница пропустила свой такт в нашем сайте. 
              Но не волнуйтесь — у нас есть множество других отличных плейлистов!
            </p>
          </div>

          {/* Навигационные кнопки */}
          <div className="not-found-actions">
            <button 
              className="action-button primary"
              onClick={() => handleNavigation('/')}
            >
              <Home size={18} />
              На главную
            </button>
            <button 
              className="action-button secondary"
              onClick={() => handleNavigation('/playlists')}
            >
              <Music size={18} />
              Все плейлисты
            </button>
          </div>

          {/* Популярные плейлисты */}
          <div className="suggestions-section">
            <h3 className="suggestions-title">
              <Headphones size={20} />
              Популярные плейлисты
            </h3>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;