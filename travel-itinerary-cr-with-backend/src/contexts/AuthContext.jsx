import React, { createContext, useContext, useState, useEffect } from 'react'
import { getToken, setToken, clearToken, apiFetch } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = getToken()

    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await apiFetch('api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        clearToken()
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      clearToken()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await fetch('api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (email, password, name) => {
    const response = await fetch('api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    try {
      await apiFetch('api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    }
    clearToken()
    setUser(null)
  }

  const updatePreferences = async (preferences) => {
    const response = await apiFetch('api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update preferences')
    }

    setUser(prev => ({ ...prev, preferences: data.preferences }))
    return data
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updatePreferences,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
