import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Navbar.css'
import CreateModal from './CreateModal'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuActive, setMenuActive] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, signOut } = useAuth()
  
  const toggleMenu = () => {
    setMenuActive(!menuActive)
  }

  const handleLogout = async () => {
    await signOut()
    setMenuActive(false)
    navigate('/')
  }
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Лого
        </Link>
        
        {/* Иконка бургер-меню для мобильных устройств */}
        <div className="menu-icon" onClick={toggleMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d={menuActive ? "M18 6L6 18M6 6L18 18" : "M3 12H21M3 6H21M3 18H21"} 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <div className={`nav-menu ${menuActive ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setMenuActive(false)}
          >
            Главная
          </Link>
          
          {!user ? (
            <>
              <Link 
                to="/register" 
                className={`nav-item ${location.pathname === '/register' ? 'active' : ''}`}
                onClick={() => setMenuActive(false)}
              >
                Регистрация
              </Link>
              <Link 
                to="/login" 
                className={`nav-item ${location.pathname === '/login' ? 'active' : ''}`}
                onClick={() => setMenuActive(false)}
              >
                Войти
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/profile" 
                className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
                onClick={() => setMenuActive(false)}
              >
                Профиль
              </Link>
              <Link 
                className="nav-item logout-btn"
                onClick={handleLogout}
              >
                Выйти
              </Link>
            </>
          )}
        </div>
        
        <button 
          className="create-button"
          onClick={() => setIsModalOpen(true)}
        >
          Создать
        </button>
        <CreateModal 
          isOpen={isModalOpen}
          currentUser={user}
          onClose={() => setIsModalOpen(false)} 
          onImportSuccess={(playlistData) => {
            setIsModalOpen(false);
            navigate('/create-playlist', { state: { playlistData } });
          }}
        />
      </div>
    </nav>
  )
}

export default Navbar