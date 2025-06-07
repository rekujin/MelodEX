import { Navigate, useLocation } from 'react-router-dom';

function PlaylistGuard({ children }) {
  const location = useLocation();
  
  if (!location.state?.playlistData) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default PlaylistGuard;
