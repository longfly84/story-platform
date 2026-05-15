import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/supabase'
import { getProfileByUserId, getRoleFromProfile } from '@/lib/adminAuth'
import type { AdminRole } from '@/lib/adminAuth'

export default function useAdminSession() {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [role, setRole] = useState<AdminRole | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadAdminSession() {
      setLoading(true)
      setError(null)

      try {
        const currentUser = await getCurrentUser()

        if (!mounted) return

        if (!currentUser) {
          setUser(null)
          setProfile(null)
          setRole(null)
          setIsAdmin(false)
          return
        }

        const adminProfile = await getProfileByUserId(currentUser.id)

        if (!mounted) return

        /**
         * Quan trọng:
         * User thường đăng nhập Supabase nhưng không có profile admin
         * thì KHÔNG được xem là staff/admin.
         */
        if (!adminProfile) {
          setUser(null)
          setProfile(null)
          setRole(null)
          setIsAdmin(false)
          return
        }

        const adminRole = getRoleFromProfile(adminProfile)

        setUser(currentUser)
        setProfile(adminProfile)
        setRole(adminRole)
        setIsAdmin(adminRole === 'admin')
      } catch (e: any) {
        if (!mounted) return

        setUser(null)
        setProfile(null)
        setRole(null)
        setIsAdmin(false)
        setError(String(e?.message ?? e))
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    void loadAdminSession()

    return () => {
      mounted = false
    }
  }, [])

  return {
    user,
    profile,
    role,
    isAdmin,
    loading,
    error
  }
}