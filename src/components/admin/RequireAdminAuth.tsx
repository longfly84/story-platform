import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentUser } from '@/lib/supabase'
import { getProfileByUserId, getRoleFromProfile } from '@/lib/adminAuth'
import type { AdminRole } from '@/lib/adminAuth'

export default function RequireAdminAuth() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    let mounted = true

    async function checkAdminSession() {
      setLoading(true)

      try {
        const currentUser = await getCurrentUser()

        if (!mounted) return

        if (!currentUser) {
          setAllowed(false)
          return
        }

        const adminProfile = await getProfileByUserId(currentUser.id)

        if (!mounted) return

        if (!adminProfile) {
          setAllowed(false)
          return
        }

        const role = getRoleFromProfile(adminProfile) as AdminRole

        /**
         * Cho cả admin và staff vào khu admin.
         * Nếu mày chỉ muốn admin thật mới vào được, đổi thành:
         * setAllowed(role === 'admin')
         */
        setAllowed(role === 'admin' || role === 'staff')
      } catch {
        if (!mounted) return
        setAllowed(false)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    void checkAdminSession()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-5 py-4 text-sm shadow-xl">
          Đang kiểm tra quyền admin...
        </div>
      </div>
    )
  }

  if (!allowed) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return <Outlet />
}