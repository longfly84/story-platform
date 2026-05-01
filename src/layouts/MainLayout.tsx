import { Link } from "react-router-dom"
import MobileMenuButton from './MobileMenuButton'
import { useEffect, useState } from "react"
import { getCurrentUser, signOut } from '@/lib/supabase'

import { Input } from "@/components/ui/input"

export default function MainLayout({
  children,
  headerRight,
  headerBottom,
}: {
  children: React.ReactNode
  headerRight?: React.ReactNode
  headerBottom?: React.ReactNode
}) {
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const u = await getCurrentUser()
        if (!mounted) return
        setIsAdminUser(!!u)
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-3 sm:px-4 sm:h-16">
          <Link to="/" className="text-base sm:text-xl font-semibold tracking-wide">
            Truyện Ngắn 24h
          </Link>

          <nav className="hidden items-center gap-4 text-sm text-zinc-300 md:flex">
            <button
              className="hover:text-zinc-100"
              onClick={() => {
                try {
                  const path = window.location.pathname
                  if (path === "/") {
                    const el = document.getElementById('categories')
                    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
                  }
                  window.location.href = '/#categories'
                } catch { window.location.href = '/#categories' }
              }}
            >Thể loại</button>

            <button
              className="hover:text-zinc-100"
              onClick={() => {
                try {
                  const path = window.location.pathname
                  if (path === "/") {
                    const el = document.getElementById('chapter-count') || document.getElementById('new-updates')
                    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
                  }
                  window.location.href = '/#chapter-count'
                } catch { window.location.href = '/#chapter-count' }
              }}
            >Theo số chương</button>
          </nav>

          <div className="ml-auto flex w-full max-w-[520px] items-center gap-2">
            {headerRight ?? (
              <Input
                placeholder="Tìm kiếm (tên truyện hoặc tác giả)…"
                className="hidden border-zinc-800/80 bg-zinc-950/30 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-amber-300/20 sm:block"
              />
            )}
          </div>

          <div className="ml-2 flex items-center md:hidden">
            {/* Mobile menu toggle handled here to avoid touching other files */}
            <MobileMenuButton />
          </div>
        </div>

        {headerBottom ? (
          <div className="mx-auto max-w-7xl px-4 pb-4 sm:hidden">
            <div className="mt-2">{headerBottom}</div>
          </div>
        ) : null}
      </header>

      {/* Global admin bar: shown when a user is logged in (admin area access) */}
      {isAdminUser ? (
        <div className="z-40 border-b border-zinc-800 bg-amber-300/8 text-xs text-zinc-100">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1 sm:py-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Admin đang đăng nhập</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/admin" className="text-xs rounded bg-zinc-900/20 px-2 py-1 text-amber-300">Admin Dashboard</Link>
              <Link to="/" className="text-xs rounded bg-zinc-900/20 px-2 py-1 text-zinc-200">Xem trang chủ</Link>
              <button
                onClick={async () => { try { await signOut() } catch {} window.location.href = '/login' }}
                className="text-xs rounded bg-zinc-800 px-2 py-1 text-zinc-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {children}
    </div>
  )
}
