import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const validateStoredToken = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await authService.validateToken(token)
          if (response.data && response.data.email) {
            setUser({
              token,
              email: response.data.email,
              role: response.data.role,
              userId: response.data.userId
            })
          } else {
            // Token invalid but got response
            localStorage.removeItem('token')
          }
        } catch (error) {
          // Token validation failed - silently remove it
          console.log('Token validation failed, clearing stored token')
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
      setInitialized(true)
    }

    validateStoredToken()
  }, [])

  const login = async (email, password) => {
    const response = await authService.login({ email, password })
    const { token, role, userId } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('userId', userId)
    setUser({ token, email, role, userId })
    return { role }
  }

  const register = async (userData) => {
    const response = await authService.register(userData)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const loginWithOAuth = useCallback(async (email, token, role, userId) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userId', userId)
    localStorage.setItem('userRole', role)
    setUser({ token, email, role, userId })
    return { role }
  }, [])

  const value = {
    user,
    loading,
    initialized,
    login,
    loginWithOAuth,
    register,
    logout,
    isAuthenticated: !!user,
    isCandidate: user?.role === 'CANDIDATE',
    isRecruiter: user?.role === 'RECRUITER',
    isAdmin: user?.role === 'ADMIN'
  }

  // DON'T BLOCK RENDERING - Let pages load immediately
  // Token validation happens in background
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
