import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import MainLayout from '@/layouts/MainLayout'
import ReaderToolbar from '@/components/reader/ReaderToolbar'
import { useReaderSettings } from '@/hooks/useReaderSettings'
import { useChapterAnalytics } from '@/hooks/useChapterAnalytics'
import { resolveCoverUrl, supabase } from '@/lib/supabase'

type ReaderErrorType = 'story' | 'chapter' | null

type ReaderChapterNavItem = {
  id?: string | null
  title?: string | null
  slug?: string | null
  number?: number | string | null
  chapter_number?: number | string | null
  chapter_slug?: string | null
  story_id?: string | null
  storyId?: string | null
  story_slug?: string | null
  storySlug?: string | null
  content?: string | null
}

type ReaderAdItem = {
  id?: string | number | null
  title?: string | null
  subtitle?: string | null
  description?: string | null
  image_url?: string | null
  target_url?: string | null
  placement?: string | null
  priority?: number | string | null
  is_active?: boolean | null
}

const CHAPTER_AD_PLACEMENTS = [
  'chapter_inline_1',
  'chapter_inline_2',
  'chapter_inline_3',
  'chapter_inline',
  'reader_inline',
  'chapter_content',
  'inline',
]


const INLINE_AD_COUNT_KEY = 'reader_inline_ad_count'

function parseInlineAdCount(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(3, Math.floor(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? Math.max(0, Math.min(3, Math.floor(parsed))) : 0
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return parseInlineAdCount(record.count ?? record.value ?? record.inlineAdCount)
  }

  return 0
}

async function loadReaderInlineAdCount() {
  const { data, error } = await supabase
    .from('ad_settings')
    .select('value')
    .eq('key', INLINE_AD_COUNT_KEY)
    .maybeSingle()

  if (error) {
    console.warn('[reader-ad-settings-load-error]', error)
    return 0
  }

  return parseInlineAdCount(data?.value)
}

function getAdPlacementSlot(ad: ReaderAdItem) {
  const placement = String(ad.placement || '')
  const matched = placement.match(/(?:chapter_inline_|reader_inline_|inline_)(\d+)/)

  if (matched) {
    const slot = Number(matched[1])
    return Number.isFinite(slot) ? slot : 99
  }

  if (placement === 'chapter_inline') return 50
  if (placement === 'reader_inline') return 60
  if (placement === 'chapter_content') return 70
  if (placement === 'inline') return 80

  return 99
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

function splitReaderContent(content: string, adCount = 0): ReaderContentSplitResult {
  const paragraphs = String(content || '')
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) {
    return {
      parts: [''],
      shouldInsertAds: false,
    }
  }

  if (adCount <= 0 || paragraphs.length <= 4) {
    return {
      parts: [paragraphs.join('\n\n')],
      shouldInsertAds: false,
    }
  }

  const safeAdCount = Math.max(0, Math.min(3, adCount))
  const partCount = Math.min(safeAdCount + 1, paragraphs.length)
  const parts: string[] = []

  for (let index = 0; index < partCount; index += 1) {
    const start = Math.floor((paragraphs.length * index) / partCount)
    const end = Math.floor((paragraphs.length * (index + 1)) / partCount)
    const part = paragraphs.slice(start, end).join('\n\n')

    if (part.trim()) parts.push(part)
  }

  return {
    parts: parts.length ? parts : [paragraphs.join('\n\n')],
    shouldInsertAds: parts.length > 1 && safeAdCount > 0,
  }
}

function normalizeChapterKey(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^chuong-/, '')
    .replace(/^chapter-/, '')
    .replace(/^ch-/, '')
}

function getNumberValue(value: unknown) {
  const parsed = Number(value || 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function getChapterNumber(chapter: ReaderChapterNavItem | null | undefined) {
  if (!chapter) return 0

  return getNumberValue(chapter.number ?? chapter.chapter_number)
}

function getChapterSlug(chapter: ReaderChapterNavItem | null | undefined) {
  if (!chapter) return '1'

  return (
    chapter.slug ||
    chapter.chapter_slug ||
    chapter.number ||
    chapter.chapter_number ||
    '1'
  )
}

function getChapterReadPath(storySlug: string, chapterItem: ReaderChapterNavItem) {
  return `/doc-truyen/${storySlug}/${getChapterSlug(chapterItem)}`
}

function resolveReaderRoute(
  params: Record<string, string | undefined>,
  pathname: string,
) {
  const pathParts = pathname
    .split('/')
    .map((item) => decodeURIComponent(item.trim()))
    .filter(Boolean)

  let pathSlug = ''
  let pathChapter = '1'

  const docIndex = pathParts.findIndex((item) => {
    return item === 'doc-truyen' || item === 'doc' || item === 'read'
  })

  if (docIndex >= 0) {
    pathSlug = pathParts[docIndex + 1] || ''
    pathChapter = pathParts[docIndex + 2] || '1'
  } else if (pathParts.length >= 2) {
    pathSlug = pathParts[pathParts.length - 2] || ''
    pathChapter = pathParts[pathParts.length - 1] || '1'
  }

  return {
    slug: params.slug || params.storySlug || params.story_slug || pathSlug || '',
    chapter:
      params.chapter ||
      params.chapterSlug ||
      params.chapterNumber ||
      params.number ||
      params.chapterId ||
      pathChapter ||
      '1',
  }
}

function sortChapters(chapters: ReaderChapterNavItem[]) {
  return [...chapters].sort((a, b) => {
    const aNumber = getChapterNumber(a)
    const bNumber = getChapterNumber(b)

    if (aNumber !== bNumber) return aNumber - bNumber

    return String(getChapterSlug(a)).localeCompare(String(getChapterSlug(b)))
  })
}

function dedupeChapters(chapters: ReaderChapterNavItem[]) {
  const uniqueMap = new Map<string, ReaderChapterNavItem>()

  for (const chapter of chapters) {
    const key =
      String(chapter.id || '') ||
      `${chapter.slug || chapter.chapter_slug || ''}-${chapter.number || chapter.chapter_number || ''}`

    if (key) uniqueMap.set(key, chapter)
  }

  return sortChapters(Array.from(uniqueMap.values()))
}

function chapterBelongsToStory(chapter: ReaderChapterNavItem, storyRow: any) {
  const storyId = String(storyRow?.id || '')
  const storySlug = String(storyRow?.slug || '')

  const chapterStoryId = String(chapter.story_id || chapter.storyId || '')
  const chapterStorySlug = String(chapter.story_slug || chapter.storySlug || '')

  return (
    (!!storyId && chapterStoryId === storyId) ||
    (!!storySlug && chapterStorySlug === storySlug)
  )
}

function findCurrentChapter(
  allChapters: ReaderChapterNavItem[],
  routeChapter: string,
) {
  const normalizedRoute = normalizeChapterKey(routeChapter || '1')

  const matched = allChapters.find((item) => {
    const itemSlug = String(item.slug || '').trim()
    const itemNumber = String(item.number || '').trim()
    const itemChapterSlug = String(item.chapter_slug || '').trim()
    const itemChapterNumber = String(item.chapter_number || '').trim()

    const candidates = [
      itemSlug,
      itemNumber,
      itemChapterSlug,
      itemChapterNumber,
      `chuong-${itemNumber}`,
      `chapter-${itemNumber}`,
      `ch-${itemNumber}`,
      `chuong-${itemChapterNumber}`,
      `chapter-${itemChapterNumber}`,
      `ch-${itemChapterNumber}`,
    ]
      .map(normalizeChapterKey)
      .filter(Boolean)

    return candidates.includes(normalizedRoute)
  })

  if (matched) return matched

  return (
    allChapters.find((item) => {
      return String(item.number || item.chapter_number || '') === '1'
    }) ||
    allChapters[0] ||
    null
  )
}

async function loadChaptersForStory(storyRow: any) {
  const allResults: ReaderChapterNavItem[] = []

  const byStoryId = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', storyRow.id)

  if (!byStoryId.error && Array.isArray(byStoryId.data)) {
    allResults.push(...(byStoryId.data as ReaderChapterNavItem[]))
  }

  if (allResults.length === 0) {
    const allChaptersResult = await supabase.from('chapters').select('*').limit(1000)

    if (!allChaptersResult.error && Array.isArray(allChaptersResult.data)) {
      const matched = (allChaptersResult.data as ReaderChapterNavItem[]).filter((item) => {
        return chapterBelongsToStory(item, storyRow)
      })

      allResults.push(...matched)
    }
  }

  return {
    chapters: dedupeChapters(allResults),
    error: byStoryId.error,
  }
}

function sortAds(ads: ReaderAdItem[]) {
  return [...ads].sort((a, b) => {
    const aSlot = getAdPlacementSlot(a)
    const bSlot = getAdPlacementSlot(b)

    if (aSlot !== bSlot) return aSlot - bSlot

    const aPriority = getNumberValue(a.priority)
    const bPriority = getNumberValue(b.priority)

    if (aPriority !== bPriority) return aPriority - bPriority

    return String(a.title || '').localeCompare(String(b.title || ''))
  })
}

async function loadChapterAds(inlineAdCount: number) {
  const safeCount = Math.max(0, Math.min(3, Math.floor(Number(inlineAdCount || 0))))

  if (safeCount <= 0) return []

  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('is_active', true)
    .in('placement', CHAPTER_AD_PLACEMENTS)

  if (error) {
    console.warn('[reader-ads-load-error]', error)
    return []
  }

  return sortAds(Array.isArray(data) ? (data as ReaderAdItem[]) : []).slice(0, safeCount)
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

function ReaderAdBlock({ ad }: { ad: ReaderAdItem }) {
  const imageUrl = ad.image_url ? resolveCoverUrl(ad.image_url) ?? ad.image_url : ''
  const targetUrl = ad.target_url || '#'

  return (
    <section className="mx-auto my-8 max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-lg shadow-black/20">
      <div className="border-b border-zinc-800 px-4 py-3 text-sm text-zinc-400">
        Quảng cáo
      </div>

      <div className="p-4 sm:p-5">
        {ad.title ? <h3 className="text-2xl font-bold text-zinc-100">{ad.title}</h3> : null}

        {ad.subtitle ? (
          <p className="mt-2 text-base leading-relaxed text-zinc-300">{ad.subtitle}</p>
        ) : null}

        {imageUrl ? (
          <a
            href={targetUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-amber-300/60"
          >
            <img
              src={imageUrl}
              alt={ad.title || 'Quảng cáo'}
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </a>
        ) : null}

        {ad.description ? (
          <p className="mt-4 text-base leading-relaxed text-zinc-300">{ad.description}</p>
        ) : null}

        {ad.target_url ? (
          <a
            href={ad.target_url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-xl bg-amber-300 px-5 py-3 text-base font-bold text-zinc-950 transition hover:bg-amber-200"
          >
            Xem thêm
          </a>
        ) : null}
      </div>
    </section>
  )
}

export default function ReaderPage() {
  const params = useParams<Record<string, string | undefined>>()
  const location = useLocation()

  const { slug, chapter } = useMemo(() => {
    return resolveReaderRoute(params, location.pathname)
  }, [params, location.pathname])

  const { fontSize, theme } = useReaderSettings()
  const [loading, setLoading] = useState(true)
  const [story, setStory] = useState<any | null>(null)
  const [chapterData, setChapterData] = useState<ReaderChapterNavItem | null>(null)
  const [chapters, setChapters] = useState<ReaderChapterNavItem[]>([])
  const [chapterAds, setChapterAds] = useState<ReaderAdItem[]>([])
  const [errorType, setErrorType] = useState<ReaderErrorType>(null)

  useEffect(() => {
    let mounted = true

    async function loadReaderData() {
      setLoading(true)
      setErrorType(null)
      setStory(null)
      setChapterData(null)
      setChapters([])

      if (!slug) {
        if (!mounted) return
        setErrorType('story')
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

        if (storyError || !storyRow) {
          setErrorType('story')
          setStory(null)
          setChapterData(null)
          setChapters([])
          setLoading(false)
          return
        }

        const [{ chapters: allChapters, error: chaptersError }, inlineAdCount] =
          await Promise.all([loadChaptersForStory(storyRow), loadReaderInlineAdCount()])
        const loadedAds = await loadChapterAds(inlineAdCount)

        if (!mounted) return

        if (import.meta.env.DEV) {
          console.log('[reader-debug]', {
            pathname: location.pathname,
            slug,
            chapter,
            storyId: storyRow.id,
            chaptersError,
            chaptersCount: allChapters.length,
            inlineAdCount,
            adsCount: loadedAds.length,
            ads: loadedAds.map((item) => ({
              id: item.id,
              placement: item.placement,
              title: item.title,
              priority: item.priority,
            })),
            chapters: allChapters.map((item) => ({
              id: item.id,
              number: item.number,
              chapter_number: item.chapter_number,
              slug: item.slug,
              chapter_slug: item.chapter_slug,
              story_id: item.story_id,
              story_slug: item.story_slug,
              title: item.title,
            })),
          })
        }

        if (allChapters.length === 0) {
          setStory(storyRow)
          setErrorType('chapter')
          setChapterData(null)
          setChapters([])
          setChapterAds(loadedAds)
          setLoading(false)
          return
        }

        const currentChapter = findCurrentChapter(allChapters, chapter)

        setStory(storyRow)
        setChapterData(currentChapter)
        setChapters(allChapters)
        setChapterAds(loadedAds)
        setErrorType(null)
        setLoading(false)
      } catch (err) {
        if (!mounted) return

        if (import.meta.env.DEV) {
          console.log('[reader-load-exception]', err)
        }

        setErrorType('story')
        setStory(null)
        setChapterData(null)
        setChapters([])
        setChapterAds([])
        setLoading(false)
      }
    }

    loadReaderData()

    return () => {
      mounted = false
    }
  }, [slug, chapter, location.pathname])

  const appliedTheme = themeStyles[theme] ?? themeStyles.dark

  const contentParts = useMemo(() => {
    return splitReaderContent(chapterData?.content || '', chapterAds.length)
  }, [chapterData?.content, chapterAds.length])

  const currentChapterIndex = useMemo(() => {
    if (!chapterData || chapters.length === 0) return -1

    return chapters.findIndex((item) => {
      return (
        String(item.id || '') === String(chapterData.id || '') ||
        normalizeChapterKey(item.slug || item.chapter_slug) ===
          normalizeChapterKey(chapterData.slug || chapterData.chapter_slug) ||
        String(item.number || item.chapter_number || '') ===
          String(chapterData.number || chapterData.chapter_number || '')
      )
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
    chapterNumber: getChapterNumber(chapterData),
  })

  useEffect(() => {
    ;(async () => {
      if (!story?.slug || !chapterData?.slug) return

      try {
        const mod = await import('@/lib/analytics/trackView')

        if (typeof mod.trackPageView === 'function') {
          await mod.trackPageView({
            path: window.location.pathname,
            storySlug: story.slug,
          })
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[track-view-error]', err)
        }
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
          Chương không tồn tại hoặc truyện này chưa có chương nào trong Supabase.

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
              toChapterNumber: getChapterNumber(nextChapter),
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
          {contentParts.parts.map((part, index) => {
            const ad = chapterAds[index]

            return (
              <div key={`${chapterData.id || chapterData.slug || chapterData.chapter_slug}-${index}`}>
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

                {contentParts.shouldInsertAds && ad && index < contentParts.parts.length - 1 ? (
                  <ReaderAdBlock ad={ad} />
                ) : null}
              </div>
            )
          })}
        </div>
      </main>
    </MainLayout>
  )
}