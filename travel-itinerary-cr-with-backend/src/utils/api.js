// src/utils/api.js
import { CONFIG } from '../constants/config.js'

const TOKEN_KEY = 'travel_auth_token'

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch (err) {
    console.error('Token storage error:', err)
  }
}

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (err) {
    console.error('Token clear error:', err)
  }
}

export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    // keep Bearer since that’s what you were using
    headers['Authorization'] = `Bearer ${token}`
  }

  // 👇 Build the full URL using CONFIG.api.baseURL
  const url = `${CONFIG.api.baseURL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers,
  })

  return response
}
