import { Link } from 'react-router-dom'
import MobileMenuButton from './MobileMenuButton'
import BackToTopButton from '@/components/BackToTopButton'
import SiteThemeToggle from '@/components/SiteThemeToggle'
import { signOut } from '@/lib/supabase'
import useAdminSession from '@/hooks/admin/useAdminSession'
import { Input } from '@/components/ui/input'

export default function MainLayout({
  children,
  headerRight,
  headerBottom,
}: {
  children: React.ReactNode
  headerRight?: React.ReactNode
  headerBottom?: React.ReactNode
}) {
  const theme = 'dark'
  const { user, role } = useAdminSession()
  const isAdminUser = !!user
  const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')

  function goToSection(sectionId: string, fallbackPath: string) {
    try {
      const path = window.location.pathname

      if (path === '/') {
        const el = document.getElementById(sectionId)

        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
          return
        }
      }

      window.location.href = fallbackPath
    } catch {
      window.location.href = fallbackPath
    }
  }

  return (
    <div
      data-theme="dark"
      className="site-root flex min-h-screen flex-col bg-zinc-950 text-zinc-100"
    >
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4">
          <Link
            to="/"
            className="min-w-0 shrink-0 whitespace-nowrap text-lg font-black leading-none tracking-tight text-zinc-100 sm:text-xl"
            aria-label="Truyện Ngắn 24h"
          >
            <span className="inline sm:hidden">Truyện 24h</span>
            <span className="hidden sm:inline">Truyện Ngắn 24h</span>
          </Link>

          <nav className="hidden items-center gap-4 text-sm text-zinc-300 md:flex">
            <button
              type="button"
              className="whitespace-nowrap hover:text-zinc-100"
              onClick={() => goToSection('categories', '/#categories')}
            >
              Thể loại
            </button>

            <button
              type="button"
              className="whitespace-nowrap hover:text-zinc-100"
              onClick={() => {
                try {
                  const path = window.location.pathname

                  if (path === '/') {
                    const el =
                      document.getElementById('chapter-count') ||
                      document.getElementById('new-updates')

                    if (el) {
                      el.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                      return
                    }
                  }

                  window.location.href = '/#chapter-count'
                } catch {
                  window.location.href = '/#chapter-count'
                }
              }}
            >
              Theo số chương
            </button>
          </nav>

          <div className="ml-auto flex min-w-0 items-center justify-end gap-2">
            {!isAdminPath ? (
              headerRight ?? (
                <Input
                  placeholder="Tìm kiếm (tên truyện hoặc tác giả)…"
                  className={`hidden w-[260px] ${
                    theme === 'dark'
                      ? 'border-zinc-800/80 bg-zinc-950/30 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-amber-300/20'
                      : 'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-amber-300/20'
                  } lg:block`}
                />
              )
            ) : null}

            <div className="hidden sm:block">
              <SiteThemeToggle />
            </div>
          </div>

          <div className="ml-1 flex shrink-0 items-center md:hidden">
            <MobileMenuButton />
          </div>
        </div>

        {headerBottom ? (
          <div className="mx-auto max-w-7xl px-4 pb-4 sm:hidden">
            <div className="mt-2">{headerBottom}</div>
          </div>
        ) : null}
      </header>

      {isAdminUser ? (
        <div className="z-40 border-b border-zinc-800 bg-amber-300/8 text-xs text-zinc-100">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1 sm:py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate font-medium">
                {role === 'staff' ? 'Nhân viên đang đăng nhập' : 'Admin đang đăng nhập'}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/admin"
                className="rounded bg-zinc-900/20 px-2 py-1 text-xs text-amber-300"
              >
                Admin
              </Link>

              <Link
                to="/"
                className="hidden rounded bg-zinc-900/20 px-2 py-1 text-xs text-zinc-200 sm:inline"
              >
                Trang chủ
              </Link>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await signOut()
                  } catch {
                    // ignore
                  }

                  window.location.href = '/login'
                }}
                className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex-1">
        {children}
        <BackToTopButton />
      </div>

      <footer className="site-footer border-t border-zinc-800 bg-zinc-950 text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link
                to="/"
                className="whitespace-nowrap text-base font-semibold text-zinc-100"
              >
                Truyện Ngắn 24h
              </Link>

              <div className="mt-1 text-sm text-zinc-400">
                Nền tảng đọc truyện ngắn và web novel tiếng Việt.
              </div>
            </div>

            <nav className="flex flex-wrap gap-3 text-sm">
              <Link to="/" className="text-zinc-300 hover:text-zinc-100">
                Trang chủ
              </Link>

              <a href="/#categories" className="text-zinc-300 hover:text-zinc-100">
                Thể loại
              </a>

              <a href="/#chapter-count" className="text-zinc-300 hover:text-zinc-100">
                Theo số chương
              </a>
            </nav>

            <div className="mt-2 text-sm text-zinc-500 sm:mt-0">
              © 2026 Truyện Ngắn 24h. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}