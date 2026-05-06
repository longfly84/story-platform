import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import MainLayout from '@/layouts/MainLayout'
import ReaderToolbar from '@/components/reader/ReaderToolbar'
import { useReaderSettings } from '@/hooks/useReaderSettings'
import { useChapterAnalytics } from '@/hooks/useChapterAnalytics'
import { supabase } from '@/lib/supabase'

type ReaderErrorType = 'story' | 'chapter' | null

type ReaderChapterNavItem = {
  id?: string | null
  title?: string | null
  slug?: string | null
  number?: number | null
}

const themeStyles: Record<string, { background: string; color: string }> = {
  dark: { background: '#0b0b0d', color: '#e6eef3' },
  light: { background: '#f8fafb', color: '#0f172a' },
  sepia: { background: '#f4ecd8', color: '#3b2f2f' },
}

type ReaderContentSplitResult = {
  parts: string[]
  shouldInsertAds: boolean
}

function splitReaderContent(content: string): ReaderContentSplitResult {
  const paragraphs = String(content || '')
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean)

  if (paragraphs.length <= 4) {
    return {
      parts: [paragraphs.join('\n\n')],
      shouldInsertAds: false,
    }
  }

  if (paragraphs.length <= 8) {
    const cut = Math.ceil(paragraphs.length / 2)

    return {
      parts: [
        paragraphs.slice(0, cut).join('\n\n'),
        paragraphs.slice(cut).join('\n\n'),
      ].filter(Boolean),
      shouldInsertAds: true,
    }
  }

  const firstCut = Math.ceil(paragraphs.length / 3)
  const secondCut = Math.ceil((paragraphs.length * 2) / 3)

  return {
    parts: [
      paragraphs.slice(0, firstCut).join('\n\n'),
      paragraphs.slice(firstCut, secondCut).join('\n\n'),
      paragraphs.slice(secondCut).join('\n\n'),
    ].filter(Boolean),
    shouldInsertAds: true,
  }
}

function getChapterReadPath(storySlug: string, chapterItem: ReaderChapterNavItem) {
  const chapterSlug = chapterItem.slug || chapterItem.number

  return `/doc-truyen/${storySlug}/${chapterSlug}`
}

function ReaderChapterHeadbar({
  storySlug,
  prevChapter,
  nextChapter,
  onNextChapterClick,
}: {
  storySlug: string
  prevChapter: ReaderChapterNavItem | null
  nextChapter: ReaderChapterNavItem | null
  onNextChapterClick?: () => void
}) {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-5 border-b border-zinc-800 bg-zinc-950/95 px-3 py-3 shadow-lg shadow-black/20 backdrop-blur sm:-mx-6 lg:-mx-8">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
        {prevChapter ? (
          <Link
            to={getChapterReadPath(storySlug, prevChapter)}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-2 py-2 text-center text-xs font-medium text-zinc-100 transition hover:bg-zinc-800 sm:flex-none sm:px-4 sm:text-sm"
            title={prevChapter.title || 'Chương trước'}
          >
            ← Chương trước
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-10 flex-1 cursor-not-allowed items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 px-2 py-2 text-center text-xs font-medium text-zinc-600 sm:flex-none sm:px-4 sm:text-sm"
          >
            ← Chương trước
          </button>
        )}

        <Link
          to={`/truyen/${storySlug}`}
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-amber-300 px-2 py-2 text-center text-xs font-bold text-zinc-950 transition hover:bg-amber-200 sm:flex-none sm:px-4 sm:text-sm"
        >
          Danh sách chương
        </Link>

        {nextChapter ? (
          <Link
            to={getChapterReadPath(storySlug, nextChapter)}
            onClick={onNextChapterClick}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-2 py-2 text-center text-xs font-medium text-zinc-100 transition hover:bg-zinc-800 sm:flex-none sm:px-4 sm:text-sm"
            title={nextChapter.title || 'Chương sau'}
          >
            Chương sau →
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-10 flex-1 cursor-not-allowed items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 px-2 py-2 text-center text-xs font-medium text-zinc-600 sm:flex-none sm:px-4 sm:text-sm"
          >
            Chương sau →
          </button>
        )}
      </div>
    </div>
  )
}

function ReaderAdBlock() {
  return (
    <section className="mx-auto my-8 max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-lg shadow-black/20">
      <div className="border-b border-zinc-800 px-4 py-3 text-sm text-zinc-400">
        Quảng cáo
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-2xl font-bold text-zinc-100">Tiny Studio</h3>

        <p className="mt-2 text-base leading-relaxed text-zinc-300">
          Ảnh viện cho mẹ bầu, bé và gia đình tại Đà Nẵng
        </p>

        <a
          href="https://www.facebook.com/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-amber-300/60"
        >
          <img
            src="/tiny-studio-ad.jpg"
            alt="Tiny Studio - ảnh viện cho mẹ bầu, bé và gia đình"
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </a>

        <p className="mt-4 text-base leading-relaxed text-zinc-300">
          Chụp ảnh newborn, mẹ bầu, baby và gia đình.
        </p>

        <a
          href="https://www.facebook.com/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-xl bg-amber-300 px-5 py-3 text-base font-bold text-zinc-950 transition hover:bg-amber-200"
        >
          Xem thêm
        </a>
      </div>
    </section>
  )
}

export default function ReaderPage() {
  const { slug, chapter } = useParams<{ slug: string; chapter: string }>()

  // All hooks must stay before every conditional return.
  const { fontSize, theme } = useReaderSettings()
  const [loading, setLoading] = useState(true)
  const [story, setStory] = useState<any | null>(null)
  const [chapterData, setChapterData] = useState<any | null>(null)
  const [chapters, setChapters] = useState<ReaderChapterNavItem[]>([])
  const [errorType, setErrorType] = useState<ReaderErrorType>(null)

  useEffect(() => {
    let mounted = true

    async function loadReaderData() {
      setLoading(true)
      setErrorType(null)
      setStory(null)
      setChapterData(null)
      setChapters([])

      if (import.meta.env.DEV) {
        console.log('[reader-params]', { slug, chapter })
      }

      if (!slug) {
        if (!mounted) return
        setErrorType('story')
        setLoading(false)
        return
      }

      if (!chapter) {
        if (!mounted) return
        setErrorType('chapter')
        setLoading(false)
        return
      }

      try {
        const { data: storyRow, error: storyError } = await supabase
          .from('stories')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (!mounted) return

        if (import.meta.env.DEV) {
          console.log('[reader-story]', { story: storyRow, storyError })
        }

        if (storyError || !storyRow) {
          setErrorType('story')
          setStory(null)
          setChapterData(null)
          setChapters([])
          setLoading(false)
          return
        }

        setStory(storyRow)

        const [chapterResult, chaptersResult] = await Promise.all([
          supabase
            .from('chapters')
            .select('*')
            .eq('story_id', storyRow.id)
            .eq('slug', chapter)
            .maybeSingle(),

          supabase
            .from('chapters')
            .select('id,title,slug,number')
            .eq('story_id', storyRow.id)
            .order('number', { ascending: true }),
        ])

        if (!mounted) return

        if (import.meta.env.DEV) {
          console.log('[reader-chapter]', {
            chapterData: chapterResult.data,
            chapterError: chapterResult.error,
          })
          console.log('[reader-chapters]', {
            chapters: chaptersResult.data,
            chaptersError: chaptersResult.error,
          })
        }

        if (chapterResult.error || !chapterResult.data) {
          setErrorType('chapter')
          setChapterData(null)
          setChapters(Array.isArray(chaptersResult.data) ? chaptersResult.data : [])
          setLoading(false)
          return
        }

        setChapterData(chapterResult.data)
        setChapters(Array.isArray(chaptersResult.data) ? chaptersResult.data : [])
        setLoading(false)
      } catch (err) {
        if (!mounted) return
        if (import.meta.env.DEV) console.log('[reader-load-exception]', err)
        setErrorType('story')
        setStory(null)
        setChapterData(null)
        setChapters([])
        setLoading(false)
      }
    }

    loadReaderData()

    return () => {
      mounted = false
    }
  }, [slug, chapter])

  const appliedTheme = themeStyles[theme] ?? themeStyles.dark

  const contentParts = useMemo(() => {
    return splitReaderContent(chapterData?.content || '')
  }, [chapterData?.content])

  const currentChapterIndex = useMemo(() => {
    if (!chapterData || chapters.length === 0) return -1

    return chapters.findIndex((item) => {
      if (chapterData.id && item.id === chapterData.id) return true
      if (chapterData.slug && item.slug === chapterData.slug) return true
      return String(item.number || '') === String(chapterData.number || '')
    })
  }, [chapterData, chapters])

  const prevChapter = useMemo(() => {
    if (currentChapterIndex <= 0) return null
    return chapters[currentChapterIndex - 1] || null
  }, [chapters, currentChapterIndex])

  const nextChapter = useMemo(() => {
    if (currentChapterIndex < 0) return null
    return chapters[currentChapterIndex + 1] || null
  }, [chapters, currentChapterIndex])

  const { trackNextChapterClick } = useChapterAnalytics({
    storyId: story?.id,
    storySlug: story?.slug,
    chapterId: chapterData?.id,
    chapterNumber: chapterData?.number,
  })

  // track reader view once per story+chapter
  useEffect(() => {
    ;(async () => {
      if (!story?.slug || !chapterData?.slug) return

      try {
        const mod = await import('@/lib/analytics/trackView')

        if (typeof mod.trackPageView === 'function') {
          if (import.meta.env.DEV) {
            console.log('[track-view-submit]', {
              path: window.location.pathname,
              storySlug: story.slug,
            })
          }

          await mod.trackPageView({
            path: window.location.pathname,
            storySlug: story.slug,
          })
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[track-view-error]', err)
      }
    })()
  }, [story?.slug, chapterData?.slug])

  if (loading) {
    return (
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-10 text-center text-zinc-400">
          Đang tải chương...
        </main>
      </MainLayout>
    )
  }

  if (errorType === 'story') {
    return (
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-10 text-center text-zinc-400">
          Truyện không tồn tại
          <div className="mt-4">
            <Link
              to="/"
              className="inline-block rounded bg-amber-300 px-4 py-2 text-zinc-950 hover:bg-amber-200"
            >
              Về trang chủ
            </Link>
          </div>
        </main>
      </MainLayout>
    )
  }

  if (errorType === 'chapter' || !story || !chapterData) {
    return (
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-10 text-center text-zinc-400">
          Chương không tồn tại
          <div className="mt-4">
            <Link
              to={story?.slug ? `/truyen/${story.slug}` : '/'}
              className="inline-block rounded bg-amber-300 px-4 py-2 text-zinc-950 hover:bg-amber-200"
            >
              Quay lại truyện
            </Link>
          </div>
        </main>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <ReaderChapterHeadbar
          storySlug={story.slug}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          onNextChapterClick={() => {
            if (!nextChapter) return

            trackNextChapterClick({
              toChapterId: nextChapter.id,
              toChapterNumber: nextChapter.number,
            })
          }}
        />

        <div className="mb-4">
          <Link to={`/truyen/${story.slug}`} className="text-sm text-amber-300 hover:underline">
            &larr; Quay lại truyện
          </Link>
        </div>

        <ReaderToolbar />

        <header className="mt-5">
          <h1 className="text-3xl font-bold leading-tight text-zinc-100 sm:text-4xl">
            {story.title}
          </h1>
          <h2 className="mt-3 text-xl font-semibold leading-snug text-zinc-300">
            {chapterData.title}
          </h2>
        </header>

        <div className="mt-6 space-y-0">
          {contentParts.parts.map((part, index) => (
            <div key={`${chapterData.id || chapterData.slug}-${index}`}>
              <article
                className="mx-auto max-w-3xl whitespace-pre-wrap rounded-xl border border-zinc-800 p-5 sm:p-7"
                style={{
                  lineHeight: 1.85,
                  fontSize: `${fontSize}px`,
                  background: appliedTheme.background,
                  color: appliedTheme.color,
                }}
              >
                {part}
              </article>

              {contentParts.shouldInsertAds && index < contentParts.parts.length - 1 ? (
                <ReaderAdBlock />
              ) : null}
            </div>
          ))}
        </div>
      </main>
    </MainLayout>
  )
}