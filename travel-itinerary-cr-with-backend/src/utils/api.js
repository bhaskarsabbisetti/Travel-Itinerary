// const TOKEN_KEY = 'travel_auth_token'

// export const getToken = () => {
//   try {
//     return localStorage.getItem(TOKEN_KEY)
//   } catch {
//     return null
//   }
// }

// export const setToken = (token) => {
//   try {
//     if (token) {
//       localStorage.setItem(TOKEN_KEY, token)
//     } else {
//       localStorage.removeItem(TOKEN_KEY)
//     }
//   } catch (err) {
//     console.error('Token storage error:', err)
//   }
// }

// export const clearToken = () => {
//   try {
//     localStorage.removeItem(TOKEN_KEY)
//   } catch (err) {
//     console.error('Token clear error:', err)
//   }
// }

// export const apiFetch = async (url, options = {}) => {
//   const token = getToken()

//   const headers = {
//     'Content-Type': 'application/json',
//     ...options.headers
//   }

//   if (token) {
//     headers['Authorization'] = `Bearer ${token}`
//   }

//   const response = await fetch(url, {
//     ...options,
//     headers
//   })

//   return response
// }

import { CONFIG } from '../constants/config.js'


const TOKEN_KEY = 'travel_auth_token'

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${CONFIG.api.baseURL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers,
  })

  return response
}
