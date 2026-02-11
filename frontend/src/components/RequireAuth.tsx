import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type RequireAuthProps = Readonly<{
  children: React.ReactNode
}>

/**
 * Redirects to /login if not authenticated. Preserves intended location in state for redirect after login.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
