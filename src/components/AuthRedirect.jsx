import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function AuthRedirect({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  
  if (loading) return null
  
  if (user) {
    const from = location.state?.from || '/'
    return <Navigate to={from} replace />
  }
  
  return children
}

export default AuthRedirect
