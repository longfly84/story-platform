import { useEffect, useState, useCallback } from 'react'

const KEY = 'tn24h_site_theme'
export type SiteTheme = 'dark' | 'light'

export function useSiteTheme() {
  const [theme, setThemeState] = useState<SiteTheme>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw === 'light' || raw === 'dark') return raw
      return 'dark'
    } catch {
      return 'dark'
    }
  })

  // apply immediately to localStorage and document root so UI changes instantly
  useEffect(() => {
    try { localStorage.setItem(KEY, theme) } catch {}
    try { document.documentElement.dataset.theme = theme } catch {}
  }, [theme])

  // Sync across tabs and ensure dataset updated when other tabs change theme
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return
      const val = e.newValue
      if (val === 'light' || val === 'dark') {
        setThemeState(val)
        try { document.documentElement.dataset.theme = val } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // ensure document element is set on mount
  useEffect(() => {
    try { document.documentElement.dataset.theme = theme } catch {}
  }, [])

  const setTheme = useCallback((t: SiteTheme) => {
    setThemeState(t)
    try { localStorage.setItem(KEY, t) } catch {}
    try { document.documentElement.dataset.theme = t } catch {}
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((s) => {
      const next = s === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem(KEY, next) } catch {}
      try { document.documentElement.dataset.theme = next } catch {}
      return next
    })
  }, [])

  return { theme, setTheme, toggleTheme }
}
