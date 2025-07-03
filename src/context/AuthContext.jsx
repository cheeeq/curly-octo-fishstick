import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        
        // Demo user kontrolü
        const demoUser = localStorage.getItem('demo_user')
        if (demoUser) {
          try {
            const user = JSON.parse(demoUser)
            console.log('Loading demo user from localStorage:', user)
            setUser(user)
            setLoading(false)
            return
          } catch (error) {
            console.error('Demo user parse error:', error)
            localStorage.removeItem('demo_user')
          }
        }

        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          console.log('Current user loaded:', currentUser)
          setUser(currentUser)
        } else {
          console.log('No current user found')
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        // Hata durumunda localStorage'ı temizle
        localStorage.removeItem('demo_user')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      console.log('Login attempt for:', credentials.email)
      
      const userData = await authService.signIn(credentials.email, credentials.password)
      
      console.log('Login successful, user data:', userData)
      setUser(userData)
      
      return { success: true, data: userData }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      console.log('Register attempt for:', userData.email)
      
      const data = await authService.signUp(userData.email, userData.password, {
        full_name: userData.fullName,
        company: userData.company,
        phone: userData.phone,
        role: userData.role
      })
      
      console.log('Register successful:', data)
      return { success: true, data }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log('Logout attempt')
      await authService.signOut()
      localStorage.removeItem('demo_user')
      setUser(null)
      console.log('Logout successful')
    } catch (error) {
      console.error('Logout error:', error)
      // Hata olsa bile kullanıcıyı çıkış yap
      localStorage.removeItem('demo_user')
      setUser(null)
    }
  }

  const resetPassword = async (email) => {
    try {
      const result = await authService.resetPassword(email)
      return { success: true, data: result }
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, error: error.message }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const result = await authService.updatePassword(newPassword)
      return { success: true, data: result }
    } catch (error) {
      console.error('Update password error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.profile?.role === 'admin' || user?.email === 'admin@gateway.com'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}