import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { signOut, supabase } from '@/lib/supabase'

type UserAuthMenuProps = {
  variant?: 'desktop' | 'mobile'
}

export default function UserAuthMenu({ variant = 'desktop' }: UserAuthMenuProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data } = await supabase.auth.getSession()

      if (!mounted) return

      setUser(data.session?.user ?? null)
      setLoading(false)
    }

    void loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    try {
      await signOut()
    } finally {
      window.location.href = '/'
    }
  }

  if (loading) {
    return null
  }

  const wrapperClass =
    variant === 'mobile'
      ? 'flex items-center justify-end gap-2'
      : 'hidden items-center gap-2 sm:flex'

  if (!user) {
    return (
      <div className={wrapperClass}>
        <Link
          to="/login"
          className="rounded-lg border border-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-100 hover:border-amber-300 hover:text-amber-300"
        >
          Đăng nhập
        </Link>

        <Link
          to="/register"
          className="rounded-lg bg-amber-300 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
        >
          Đăng ký
        </Link>
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <span className="max-w-[160px] truncate text-sm text-zinc-300">
        {user.email}
      </span>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg border border-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-100 hover:border-amber-300 hover:text-amber-300"
      >
        Đăng xuất
      </button>
    </div>
  )
}