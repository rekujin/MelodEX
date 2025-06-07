import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingSpinner } from '../ui/LoadingSpinner'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  
  if (loading) return <LoadingSpinner />
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  
  return children
}

export default RequireAuth
