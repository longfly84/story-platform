import { useState, useEffect, useCallback } from 'react'

const FONT_KEY = 'reader_font_size'
const THEME_KEY = 'reader_theme'
const DEFAULT_FONT = 18
const MIN_FONT = 14
const MAX_FONT = 26
const STEP = 2

export type ReaderTheme = 'dark' | 'light' | 'sepia'

// Module-level shared state so multiple components using the hook
// stay in sync without relying on reading localStorage in render.
let globalFont: number | null = null
let globalTheme: ReaderTheme | null = null
type Subscriber = (s: { fontSize: number; theme: ReaderTheme }) => void
const subscribers = new Set<Subscriber>()

function notifyAll(font: number, theme: ReaderTheme) {
  for (const s of subscribers) {
    try { s({ fontSize: font, theme }) } catch {}
  }
}

function ensureGlobalsInitialized() {
  if (globalFont !== null && globalTheme !== null) return
  try {
    const rawFont = localStorage.getItem(FONT_KEY)
    const v = rawFont ? parseInt(rawFont, 10) : DEFAULT_FONT
    globalFont = isNaN(v) ? DEFAULT_FONT : Math.max(MIN_FONT, Math.min(MAX_FONT, v))
  } catch {
    globalFont = DEFAULT_FONT
  }

  try {
    const rawTheme = localStorage.getItem(THEME_KEY)
    if (rawTheme === 'dark' || rawTheme === 'light' || rawTheme === 'sepia') globalTheme = rawTheme
    else globalTheme = 'light'
  } catch {
    globalTheme = 'light'
  }
}

export function useReaderSettings() {
  ensureGlobalsInitialized()

  const [fontSize, setFontSize] = useState<number>(globalFont ?? DEFAULT_FONT)
  const [theme, setThemeState] = useState<ReaderTheme>(globalTheme ?? 'light')

  useEffect(() => {
    const sub: Subscriber = ({ fontSize: f, theme: t }) => {
      setFontSize(f)
      setThemeState(t)
    }
    subscribers.add(sub)

    // Sync local state with globals immediately
    setFontSize(globalFont ?? DEFAULT_FONT)
    setThemeState(globalTheme ?? 'light')

    return () => {
      subscribers.delete(sub)
    }
  }, [])

  const increaseFont = useCallback(() => {
    ensureGlobalsInitialized()
    const next = Math.min(MAX_FONT, (globalFont ?? DEFAULT_FONT) + STEP)
    globalFont = next
    // Update all hook instances immediately
    notifyAll(globalFont, globalTheme ?? (theme as ReaderTheme))
    try { localStorage.setItem(FONT_KEY, String(globalFont)) } catch {}
  }, [theme])

  const decreaseFont = useCallback(() => {
    ensureGlobalsInitialized()
    const next = Math.max(MIN_FONT, (globalFont ?? DEFAULT_FONT) - STEP)
    globalFont = next
    notifyAll(globalFont, globalTheme ?? (theme as ReaderTheme))
    try { localStorage.setItem(FONT_KEY, String(globalFont)) } catch {}
  }, [theme])

  const setTheme = useCallback((t: ReaderTheme) => {
    ensureGlobalsInitialized()
    globalTheme = t
    notifyAll(globalFont ?? (fontSize as number), globalTheme)
    try { localStorage.setItem(THEME_KEY, globalTheme) } catch {}
  }, [fontSize])

  const resetSettings = useCallback(() => {
    globalFont = DEFAULT_FONT
    globalTheme = 'light'
    notifyAll(globalFont, globalTheme)
    try {
      localStorage.setItem(FONT_KEY, String(globalFont))
      localStorage.setItem(THEME_KEY, globalTheme)
    } catch {}
  }, [])

  return { fontSize, theme, increaseFont, decreaseFont, setTheme, resetSettings }
}
