import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/supabase'
import { getProfileByUserId, getRoleFromProfile } from '@/lib/adminAuth'
import type { AdminRole } from '@/lib/adminAuth'

export default function useAdminSession() {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [role, setRole] = useState<AdminRole>('staff')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const u = await getCurrentUser()
        if (!mounted) return
        setUser(u)
        if (!u) {
          setProfile(null)
          setRole('staff')
          setIsAdmin(false)
          return
        }
        const p = await getProfileByUserId(u.id)
        if (!mounted) return
        setProfile(p)
        const r = getRoleFromProfile(p)
        setRole(r)
        setIsAdmin(r === 'admin')
      } catch (e: any) {
        if (!mounted) return
        setError(String(e?.message ?? e))
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return { user, profile, role, isAdmin, loading, error }
}
