import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import ReaderToolbar from '@/components/reader/ReaderToolbar'
import { useReaderSettings } from '@/hooks/useReaderSettings'
import { supabase } from '@/lib/supabase'

type ReaderErrorType = 'story' | 'chapter' | null

const themeStyles: Record<string, { background: string; color: string }> = {
  dark: { background: '#0b0b0d', color: '#e6eef3' },
  light: { background: '#f8fafb', color: '#0f172a' },
  sepia: { background: '#f4ecd8', color: '#3b2f2f' },
}

export default function ReaderPage() {
  const { slug, chapter } = useParams<{ slug: string; chapter: string }>()

  // All hooks must stay before every conditional return.
  const { fontSize, theme } = useReaderSettings()
  const [loading, setLoading] = useState(true)
  const [story, setStory] = useState<any | null>(null)
  const [chapterData, setChapterData] = useState<any | null>(null)
  const [errorType, setErrorType] = useState<ReaderErrorType>(null)

  useEffect(() => {
    let mounted = true

    async function loadReaderData() {
      setLoading(true)
      setErrorType(null)
      setStory(null)
      setChapterData(null)

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
          setLoading(false)
          return
        }

        setStory(storyRow)

        const { data: chapterRow, error: chapterError } = await supabase
          .from('chapters')
          .select('*')
          .eq('story_id', storyRow.id)
          .eq('slug', chapter)
          .maybeSingle()

        if (!mounted) return

        if (import.meta.env.DEV) {
          console.log('[reader-chapter]', { chapterData: chapterRow, chapterError })
        }

        if (chapterError || !chapterRow) {
          setErrorType('chapter')
          setChapterData(null)
          setLoading(false)
          return
        }

        setChapterData(chapterRow)
        setLoading(false)

        // Non-blocking analytics. Do not crash reader if analytics helper changes/fails.
        void import('@/lib/analytics/trackView')
          .then((mod: any) => {
            if (typeof mod.trackPageView === 'function') {
              return mod.trackPageView({
                path: window.location.pathname,
                storySlug: storyRow.slug,
              })
            }
            return null
          })
          .catch((err) => {
            if (import.meta.env.DEV) console.warn('[reader-track-view-error]', err)
          })
      } catch (err) {
        if (!mounted) return
        if (import.meta.env.DEV) console.log('[reader-load-exception]', err)
        setErrorType('story')
        setStory(null)
        setChapterData(null)
        setLoading(false)
      }
    }

    loadReaderData()

    return () => {
      mounted = false
    }
  }, [slug, chapter])

  const appliedTheme = themeStyles[theme] ?? themeStyles.dark

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
        <div className="mb-4">
          <Link to={`/truyen/${story.slug}`} className="text-sm text-amber-300 hover:underline">
            &larr; Quay lại truyện
          </Link>
        </div>

        <ReaderToolbar />

        <header className="mt-5">
          <h1 className="text-3xl font-bold text-zinc-100">{story.title}</h1>
          <h2 className="mt-2 text-xl font-semibold text-zinc-300">{chapterData.title}</h2>
        </header>

        <article
          className="mx-auto mt-6 max-w-3xl whitespace-pre-wrap rounded-xl border border-zinc-800 p-5 sm:p-7"
          style={{
            lineHeight: 1.85,
            fontSize: `${fontSize}px`,
            background: appliedTheme.background,
            color: appliedTheme.color,
          }}
        >
          {chapterData.content}
        </article>
      </main>
    </MainLayout>
  )
}
