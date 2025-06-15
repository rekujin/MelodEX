// MobileBottomNavbar.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMobile } from "../../hooks/useMobile";
import "./MobileBottomNavbar.css";

function MobileBottomNavbar() {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useMobile(768);

  const navItems = [
    {
      path: "/",
      label: "Главная",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="9,22 9,12 15,12 15,22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      path: "/playlists",
      label: "Библиотека",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 9h-5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 15h-2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      requiresAuth: true,
    },
    {
      path: "/search",
      label: "Поиск",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle
            cx="11"
            cy="11"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="m21 21-4.35-4.35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      path: user ? "/profile" : "/login",
      label: "Профиль",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  if (!isMobile) return null;

  return (
    <nav className="mobile-bottom-navbar">
      <div className="navbar-content">
        {navItems.map((item) => {
          if (item.requiresAuth && !user) return null;

          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-tab ${isActive ? "active" : ""}`}
            >
              <div className="nav-tab-content">
                <div className="nav-icon">{item.icon}</div>
                <span className="nav-label">{item.label}</span>
                {isActive && <div className="active-indicator" />}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNavbar;