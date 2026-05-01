import { supabase } from './supabase'

export type AdminRole = "admin" | "staff"

export async function getProfileByUserId(userId: string) {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) throw error
    return data ?? null
  } catch (e) {
    if (import.meta.env.DEV) console.warn('getProfileByUserId failed', e)
    return null
  }
}

export function getRoleFromProfile(profile: any): AdminRole {
  try {
    if (profile?.role === 'admin') return 'admin'
  } catch (e) {}
  return 'staff'
}
