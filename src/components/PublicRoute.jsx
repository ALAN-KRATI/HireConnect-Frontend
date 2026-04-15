import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'RECRUITER') {
      return <Navigate to="/recruiter/dashboard" replace />
    } else if (user?.role === 'CANDIDATE') {
      return <Navigate to="/candidate/dashboard" replace />
    }
  }

  return children
}

export default PublicRoute
