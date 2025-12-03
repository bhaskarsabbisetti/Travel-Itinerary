import { createClient, SupabaseClient } from '@supabase/supabase-js'

let cachedJWT: string | null = null
let jwtExpiry = 0

async function getProjectJWT(): Promise<string> {
  if (cachedJWT && Date.now() < jwtExpiry - 86400000) {
    return cachedJWT
  }

  const jwtUrl = `${process.env.AMAPOLA_API_URL}/projects/${process.env.PROJECT_ID}/jwt`

  const response = await fetch(jwtUrl, {
    headers: {
      'Authorization': `Bearer ${process.env.AMAPOLA_AUTH_TOKEN}`
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get JWT: ${response.status} ${errorText}`)
  }

  const { jwt, expires_in } = await response.json()
  cachedJWT = jwt
  jwtExpiry = Date.now() + (expires_in * 1000)

  return cachedJWT
}

export const supabase: SupabaseClient | null =
  process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      accessToken: async () => await getProjectJWT()
    })
    : null

export const isSupabaseReady = (): boolean => !!supabase

const TABLE_PREFIX =
  process.env.TABLE_PREFIX ||
  (process.env.PROJECT_ID ? 'proj_' + process.env.PROJECT_ID.replace(/-/g, '') : '')

export const getTableName = (base: string): string => {
  if (!TABLE_PREFIX) return base
  const safe = base.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
  const prefix = TABLE_PREFIX.endsWith('_') ? TABLE_PREFIX : TABLE_PREFIX + '_'
  const full = prefix + safe
  return full.length > 63 ? full.slice(0, 63) : full
}
