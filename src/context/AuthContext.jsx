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

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Validate token and get user info
      authService.validateToken(token)
        .then(response => {
          if (response.data) {
            setUser({
              token,
              email: response.data.email,
              role: response.data.role,
              userId: response.data.userId
            })
          }
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const response = await authService.login({ email, password })
    const { token, role, userId } = response.data
    localStorage.setItem('token', token)
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
    setUser({ token, email, role, userId })
    return { role }
  }, [])

  const value = {
    user,
    loading,
    login,
    loginWithOAuth,
    register,
    logout,
    isAuthenticated: !!user,
    isCandidate: user?.role === 'CANDIDATE',
    isRecruiter: user?.role === 'RECRUITER'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
