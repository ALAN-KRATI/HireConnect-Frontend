import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const OAuthCallback = () => {
  const navigate = useNavigate()
  const { loginWithOAuth } = useAuth()

  useEffect(() => {
    // Extract token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const refreshToken = urlParams.get('refreshToken')
    const role = urlParams.get('role')
    const userId = urlParams.get('userId')
    const email = urlParams.get('email')

    if (token) {
      // Store token in localStorage
      localStorage.setItem('token', token)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }

      // Update auth context
      loginWithOAuth(email, token, role, userId)
        .then(() => {
          // Redirect based on role
          if (role === 'RECRUITER') {
            navigate('/recruiter/dashboard')
          } else {
            navigate('/candidate/dashboard')
          }
        })
        .catch((err) => {
          console.error('OAuth login failed:', err)
          navigate('/login')
        })
    } else {
      // No token found, redirect to login
      navigate('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Completing login...</h2>
        <p className="text-gray-600 mt-2">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}

export default OAuthCallback
