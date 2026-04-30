import { useState, useEffect, useRef } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
// Helmet imported in ReaderPage not used since we manipulate meta tags directly

import MainLayout from "@/layouts/MainLayout"
import { getStoryBySlug } from "@/data/stories"
import { fetchChaptersByStorySlug } from "@/lib/supabase"
import { saveReadingHistory, getReadingHistory, isStoryFollowed, followStory } from "@/lib/localStorageHelpers"
// formatCount not used here but keep import for future extensibility

export default function ReaderPage() {
  const { slug, chapter } = useParams<{ slug: string; chapter: string }>()
  const navigate = useNavigate()
  const story = slug ? getStoryBySlug(slug) : undefined

  type ReaderSettings = {
    fontSize: "small" | "medium" | "large"
    lineHeight: number
    contentWidth: string
  }

  const DEFAULT_SETTINGS: ReaderSettings = {
    fontSize: "medium",
    lineHeight: 1.6,
    contentWidth: "48rem",
  }

  const [fontSize, setFontSize] = useState<ReaderSettings["fontSize"]>(() => {
    try {
      const raw = localStorage.getItem("readerSettings")
      if (!raw) return DEFAULT_SETTINGS.fontSize
      const s = JSON.parse(raw) as ReaderSettings
      return s.fontSize ?? DEFAULT_SETTINGS.fontSize
    } catch {
      return DEFAULT_SETTINGS.fontSize
    }
  }) // small, medium, large
  const [lineHeight, setLineHeight] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("readerSettings")
      if (!raw) return DEFAULT_SETTINGS.lineHeight
      const s = JSON.parse(raw) as ReaderSettings
      return s.lineHeight ?? DEFAULT_SETTINGS.lineHeight
    } catch {
      return DEFAULT_SETTINGS.lineHeight
    }
  })
  const [contentWidth, setContentWidth] = useState<string>(() => {
    try {
      const raw = localStorage.getItem("readerSettings")
      if (!raw) return DEFAULT_SETTINGS.contentWidth
      const s = JSON.parse(raw) as ReaderSettings
      return s.contentWidth ?? DEFAULT_SETTINGS.contentWidth
    } catch {
      return DEFAULT_SETTINGS.contentWidth
    }
  })

  const articleRef = useRef<HTMLElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [showBackTop, setShowBackTop] = useState(false)
  const [followed, setFollowed] = useState(false)
  const [hadHistoryInitially] = useState(() => {
    try {
      return !!getReadingHistory().find((h) => h.storySlug === (story?.slug ?? ""))
    } catch {
      return false
    }
  })

  // persist settings
  useEffect(() => {
    const s: ReaderSettings = { fontSize, lineHeight, contentWidth }
    try {
      localStorage.setItem("readerSettings", JSON.stringify(s))
    } catch {}
  }, [fontSize, lineHeight, contentWidth])

  if (!story) {
    return (
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-10 text-center text-zinc-400">
          Truyện không tồn tại
          <div className="mt-4">
            <Link
              to={`/`}
              className="inline-block rounded bg-amber-300 px-4 py-2 text-zinc-950 hover:bg-amber-200"
            >
              Về trang chủ
            </Link>
          </div>
        </main>
      </MainLayout>
    )
  }

  // Cho phép nhận chapter là số hoặc slug
  let currentChapter = undefined
  let chapterIndex = -1
  if (chapter) {
    if (/^\d+$/.test(chapter)) {
      // Nếu chapter là số, tìm chương có number === số đó
      chapterIndex = story.chapters.findIndex((c) => c.number === Number(chapter))
    } else {
      // Nếu chapter là slug, tìm chương có slug === chapter
      chapterIndex = story.chapters.findIndex((c) => c.slug === chapter)
    }
    currentChapter = chapterIndex !== -1 ? story.chapters[chapterIndex] : undefined
  }

  // Nếu không tìm thấy chương, fallback về chương đầu tiên
  if (!currentChapter) {
    chapterIndex = 0
    currentChapter = story.chapters[0]
  }
  
  if (!currentChapter) {
    return (
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-10 text-center text-zinc-400">
          Chương không tồn tại
          <div className="mt-4">
            <Link
              to={`/doc-truyen/${slug}/1`}
              className="inline-block rounded bg-amber-300 px-4 py-2 text-zinc-950 hover:bg-amber-200"
            >
              Về trang chủ
            </Link>
          </div>
        </main>
      </MainLayout>
    )
  }

  const prevChapter = chapterIndex > 0 ? story.chapters[chapterIndex - 1] : null
  const nextChapter = chapterIndex < story.chapters.length - 1 ? story.chapters[chapterIndex + 1] : null

  // Nút Đọc chương mới nhất dẫn tới chương mới nhất
  const latestChapter = story.chapters[story.chapters.length - 1]

  const fontSizeClasses: Record<string, string> = {
    small: "text-sm leading-relaxed",
    medium: "text-base leading-relaxed",
    large: "text-lg leading-relaxed",
  }

  // Save reading history on mount or when story/chapter changes
  useEffect(() => {
    if (story && currentChapter) {
      saveReadingHistory({
        storySlug: story.slug,
        storyTitle: story.title,
        chapterSlug: currentChapter.slug,
        chapterNumber: currentChapter.number,
        chapterTitle: currentChapter.title,
        lastRead: Date.now(),
      })
    }
  }, [story, currentChapter])

  // try load chapters from supabase
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!story) return
      const remote = await fetchChaptersByStorySlug(story.slug)
      if (!mounted) return
      if (remote && Array.isArray(remote) && remote.length) {
        // try to map remote chapters into story.chapters shape if possible
        story.chapters = remote.map((r: any) => ({ number: r.number, slug: r.slug, id: r.id ?? r.slug, title: r.title, content: r.content ?? [r.content], publishedAt: r.published_at ?? r.created_at }))
      }
    })()
    return () => { mounted = false }
  }, [story])

  // follow state
  useEffect(() => {
    if (!story) return
    setFollowed(isStoryFollowed(story.slug))
  }, [story])

  // progress and back-to-top handling
  useEffect(() => {
    const handler = () => {
      const el = articleRef.current
      const scrollY = window.scrollY
      setShowBackTop(scrollY > 300)

      if (!el) {
        setProgress(0)
        return
      }
      const rect = el.getBoundingClientRect()
      const top = window.scrollY + rect.top
      const height = rect.height
      const windowH = window.innerHeight
      const totalScrollable = Math.max(0, height - windowH)
      const scrolled = window.scrollY - top
      const pct = totalScrollable > 0 ? Math.max(0, Math.min(1, scrolled / totalScrollable)) : (window.scrollY > top ? 1 : 0)
      setProgress(Math.round(pct * 100))
    }

    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)
    handler()
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', handler)
    }
  }, [articleRef, currentChapter])

  // Auto-hide floating buttons on scroll (mobile) - toggle classes to avoid direct style calls
  useEffect(() => {
    // Only enable on small screens (match Tailwind lg breakpoint: 1024px)
    if (typeof window === 'undefined') return
    let lastY = window.scrollY
    let ticking = false
    let idleTimer: number | undefined
    const isMobile = () => window.innerWidth < 1024

    const showButtons = () => {
      const els = document.querySelectorAll<HTMLElement>('.mobile-floating-nav')
      els.forEach((e) => e.classList.remove('opacity-0', 'pointer-events-none'))
    }
    const hideButtons = () => {
      const els = document.querySelectorAll<HTMLElement>('.mobile-floating-nav')
      els.forEach((e) => e.classList.add('opacity-0', 'pointer-events-none'))
    }

    const handler = () => {
      if (!isMobile()) return
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY
          const delta = currentY - lastY
          // scroll down -> hide; scroll up -> show
          if (delta > 10) {
            hideButtons()
          } else if (delta < -10) {
            showButtons()
          }

          // clear previous idle timer
          if (idleTimer) window.clearTimeout(idleTimer)
          // when scrolling stops for 300ms, show buttons
          idleTimer = window.setTimeout(() => {
            showButtons()
          }, 300)

          lastY = currentY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', handler)
      if (idleTimer) window.clearTimeout(idleTimer)
    }
  }, [])

  useEffect(() => {
    // dynamic document title/meta for reader
    const title = `${currentChapter?.title ?? ''} - ${story?.title ?? ''}`.trim() || 'Reader'
    document.title = title
    const meta = document.querySelector('meta[name="description"]')
    const desc = `Đọc ${currentChapter?.title ?? 'chương'} của ${story?.title ?? ''}`
    if (meta) {
      meta.setAttribute('content', desc)
    } else {
      const m = document.createElement('meta')
      m.name = 'description'
      m.content = desc
      document.head.appendChild(m)
    }
    // Open graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)
    else {
      const m = document.createElement('meta')
      m.setAttribute('property', 'og:title')
      m.content = title
      document.head.appendChild(m)
    }
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', desc)
    else {
      const m = document.createElement('meta')
      m.setAttribute('property', 'og:description')
      m.content = desc
      document.head.appendChild(m)
    }
    const ogImage = document.querySelector('meta[property="og:image"]')
    const imageUrl = story?.coverImage ?? (story as any).cover_image ?? ''
    if (ogImage) ogImage.setAttribute('content', imageUrl)
    else if (imageUrl) {
      const m = document.createElement('meta')
      m.setAttribute('property', 'og:image')
      m.content = imageUrl
      document.head.appendChild(m)
    }
  }, [story, currentChapter])

  return (
    <>
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <Link
              to={`/truyen/${story.slug}`}
              className="text-sm text-amber-300 hover:underline"
            >
              &larr; Quay lại trang truyện
            </Link>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <button
                onClick={() => setFontSize("small")}
                className={`rounded px-2 py-1 hover:bg-zinc-700 ${
                  fontSize === "small" ? "bg-zinc-700" : ""
                }`}
                aria-label="Cỡ chữ nhỏ"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize("medium")}
                className={`rounded px-2 py-1 hover:bg-zinc-700 ${
                  fontSize === "medium" ? "bg-zinc-700" : ""
                }`}
                aria-label="Cỡ chữ vừa"
              >
                A
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={`rounded px-2 py-1 hover:bg-zinc-700 ${
                  fontSize === "large" ? "bg-zinc-700" : ""
                }`}
                aria-label="Cỡ chữ lớn"
              >
                A+
              </button>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(`/doc-truyen/${slug}/${story.chapters[0]?.slug ?? "chuong-1"}`)}
              className="rounded bg-amber-300 px-4 py-2 text-zinc-950 hover:bg-amber-200"
            >
              Đọc từ đầu
            </button>

            {/* Font size controls (existing) */}
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <button
                onClick={() => setFontSize("small")}
                className={`rounded px-2 py-1 hover:bg-zinc-700 ${fontSize === "small" ? "bg-zinc-700" : ""}`}
                aria-label="Cỡ chữ nhỏ"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize("medium")}
                className={`rounded px-2 py-1 hover:bg-zinc-700 ${fontSize === "medium" ? "bg-zinc-700" : ""}`}
                aria-label="Cỡ chữ vừa"
              >
                A
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={`rounded px-2 py-1 hover:bg-zinc-700 ${fontSize === "large" ? "bg-zinc-700" : ""}`}
                aria-label="Cỡ chữ lớn"
              >
                A+
              </button>
            </div>

            {/* Line height and width controls (minimal UI) */}
            <div className="ml-4 flex items-center gap-2 text-sm text-zinc-400">
              <label className="text-xs text-zinc-500">Line</label>
              <button onClick={() => setLineHeight((v) => Math.max(1, +(v - 0.1).toFixed(2)))} className="rounded px-2 py-1 hover:bg-zinc-700">-</button>
              <div className="px-2">{lineHeight.toFixed(2)}</div>
              <button onClick={() => setLineHeight((v) => +(v + 0.1).toFixed(2))} className="rounded px-2 py-1 hover:bg-zinc-700">+</button>
            </div>

            <div className="ml-4 flex items-center gap-2 text-sm text-zinc-400">
              <label className="text-xs text-zinc-500">Width</label>
              <button onClick={() => setContentWidth((w) => {
                const val = parseFloat(w)
                return `${Math.max(32, val - 4)}rem`
              })} className="rounded px-2 py-1 hover:bg-zinc-700">-</button>
              <div className="px-2">{contentWidth}</div>
              <button onClick={() => setContentWidth((w) => {
                const val = parseFloat(w)
                return `${Math.min(120, val + 4)}rem`
              })} className="rounded px-2 py-1 hover:bg-zinc-700">+</button>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-zinc-100">{story.title}</h1>
          <h2 className="mt-1 text-xl font-semibold text-zinc-300">{currentChapter.title}</h2>

          {/* Empty states: show when user hasn't read this story before or hasn't followed */}
          {!hadHistoryInitially && (
            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-zinc-100">Bạn chưa đọc truyện này</div>
                  <div className="mt-1 text-xs text-zinc-400">Bắt đầu đọc để lưu lịch sử và tiếp tục sau dễ dàng hơn.</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/doc-truyen/${slug}/${story.chapters[0]?.slug ?? "chuong-1"}`)} className="rounded bg-amber-300 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200">Đọc từ đầu</button>
                  {!followed ? (
                    <button onClick={() => { if (story) { followStory(story.slug); setFollowed(true) } }} className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-900/50">Theo dõi</button>
                  ) : (
                    <button disabled className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm font-semibold text-zinc-500">Đang theo dõi</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-4 h-2 w-full rounded bg-zinc-800/50 overflow-hidden">
            <div
              role="progressbar"
              aria-valuenow={progress}
              style={{ width: `${progress}%`, transition: 'width 220ms linear' }}
              className="h-full bg-amber-300"
            />
          </div>

          <article
            ref={articleRef}
            className={`mt-6 space-y-6 rounded bg-zinc-900/20 p-6 text-zinc-200 ${fontSizeClasses[fontSize]}`}
            style={{ whiteSpace: "pre-wrap", lineHeight: lineHeight, maxWidth: contentWidth }}
          >
            {currentChapter.content}
          </article>

          {/* Back to top and progress label */}
          <div className="fixed right-4 bottom-20 z-50 flex flex-col items-end gap-2 lg:bottom-8">
            {showBackTop && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="rounded-full bg-zinc-800/80 p-3 text-zinc-100 shadow-lg hover:bg-zinc-800"
                aria-label="Back to top"
              >
                ↑
              </button>
            )}
            <div className="rounded bg-zinc-900/70 px-2 py-1 text-xs text-zinc-200">{progress}%</div>
          </div>

          <nav className="sticky bottom-0 left-0 z-50 mt-6 flex w-full max-w-4xl justify-between gap-4 rounded-t bg-zinc-900/80 px-4 py-3 backdrop-blur-sm sm:static sm:bg-transparent sm:px-0">
            <button
              onClick={() => prevChapter && navigate(`/doc-truyen/${slug}/${prevChapter.slug}`)}
              disabled={!prevChapter}
              className={`rounded px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                prevChapter ? "bg-amber-300 text-zinc-950 hover:bg-amber-200" : "bg-zinc-700 text-zinc-400"
              }`}
            >
              Chương trước
            </button>
            <button
              onClick={() => nextChapter && navigate(`/doc-truyen/${slug}/${nextChapter.slug}`)}
              disabled={!nextChapter}
              className={`rounded px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                nextChapter ? "bg-amber-300 text-zinc-950 hover:bg-amber-200" : "bg-zinc-700 text-zinc-400"
              }`}
            >
              Chương sau
            </button>
          </nav>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => navigate(`/doc-truyen/${slug}/${latestChapter.slug}`)}
              className="rounded bg-amber-300 px-4 py-2 text-zinc-950 hover:bg-amber-200"
            >
              Đọc chương mới nhất
            </button>
          </div>

          {/* Mobile floating prev/next buttons */}
          <div className="lg:hidden">
            <div className="fixed bottom-6 left-4 z-50 mobile-floating-nav transition-opacity duration-200">
              <button
                onClick={() => prevChapter && navigate(`/doc-truyen/${slug}/${prevChapter.slug}`)}
                disabled={!prevChapter}
                aria-label="Chương trước"
                className={`rounded-full p-3 shadow-lg text-zinc-100 ${prevChapter ? 'bg-zinc-800/80 hover:bg-zinc-800' : 'bg-zinc-700/40 opacity-50 cursor-not-allowed'}`}
              >
                ‹
              </button>
            </div>
            <div className="fixed bottom-6 right-4 z-50 mobile-floating-nav transition-opacity duration-200">
              <button
                onClick={() => nextChapter && navigate(`/doc-truyen/${slug}/${nextChapter.slug}`)}
                disabled={!nextChapter}
                aria-label="Chương sau"
                className={`rounded-full p-3 shadow-lg text-zinc-100 ${nextChapter ? 'bg-zinc-800/80 hover:bg-zinc-800' : 'bg-zinc-700/40 opacity-50 cursor-not-allowed'}`}
              >
                ›
              </button>
            </div>
          </div>
        </main>
      </MainLayout>
    </>
  )
}