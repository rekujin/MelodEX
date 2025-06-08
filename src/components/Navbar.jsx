import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Navbar.css'
import CreateModal from './CreateModal'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuActive, setMenuActive] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, signOut } = useAuth()
  const profileDropdownRef = useRef(null)
  
  const toggleMenu = () => {
    setMenuActive(!menuActive)
  }

  const handleLogout = async () => {
    await signOut()
    setMenuActive(false)
    setProfileDropdownOpen(false)
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Поиск:', searchQuery)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-melod">Melod</span>
          <span className="logo-ex">EX</span>
        </Link>
        
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-container">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input
              type="text"
              placeholder="Поиск музыки..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </form>
        
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
              <button 
                className="create-button"
                onClick={() => setIsModalOpen(true)}
              >
                Создать
              </button>
              
              <div className="navbar-profile-container" ref={profileDropdownRef}>
                <div 
                  className="profile-avatar"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <img 
                    src="/path/to/avatar.jpg" 
                    alt="Profile" 
                    className="avatar-image"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="avatar-fallback">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                
                {profileDropdownOpen && (
                  <div className="profile-dropdown">
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        setMenuActive(false)
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Профиль
                    </Link>
                    <button 
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2"/>
                        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
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