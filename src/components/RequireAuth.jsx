import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  
  if (loading) return null
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  
  return children
}

export default RequireAuth
