import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingSpinner } from '../ui/LoadingSpinner'

function AuthRedirect({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  
  if (loading) return <LoadingSpinner />
  
  if (user) {
    const from = location.state?.from || '/'
    return <Navigate to={from} replace />
  }
  
  return children
}

export default AuthRedirect
