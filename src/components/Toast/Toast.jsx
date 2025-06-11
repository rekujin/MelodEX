import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

import './Toast.css'

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Время анимации закрытия
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  return (
    <>
      <div 
        className={`toast toast-${type} ${isVisible && !isClosing ? 'toast-show' : 'toast-hide'}`}
      >
        {/* Светящийся эффект */}
        <div className="toast-glow"></div>
        
        {/* Основной контент */}
        <div className="toast-content">
          {/* Иконка */}
          <div className="toast-icon">
            {getIcon()}
          </div>

          {/* Сообщение */}
          <div className="toast-message">
            {message}
          </div>

          {/* Кнопка закрытия */}
          <button
            onClick={handleClose}
            className="toast-close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Прогресс-бар */}
        <div className="toast-progress">
          <div 
            className="toast-progress-bar"
            style={{
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Toast;