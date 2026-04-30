import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client. Use process.env so it works in serverless functions.
const env = (globalThis as any)?.process?.env
const url = env?.VITE_SUPABASE_URL
const key = env?.VITE_SUPABASE_ANON_KEY

// Dev-only presence logs
if ((env?.NODE_ENV ?? 'development') !== 'production') {
  console.debug('[supabaseServer] SUPABASE_URL present:', !!url)
  console.debug('[supabaseServer] SUPABASE_ANON_KEY present:', !!key)
}

export const supabase = (url && key) ? createClient(url, key) : null

export function hasSupabaseEnv() {
  return !!(url && key)
}
