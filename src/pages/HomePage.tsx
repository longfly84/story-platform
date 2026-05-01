import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import StoryCard from "@/components/home/StoryCard"
import { resolveCoverUrl } from '@/lib/supabase'
import MainLayout from "@/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
import {
  genres,
  getStoryBySlug,
  stories,
} from "@/data/stories"
import { fetchStoriesFromSupabase } from "@/lib/supabase"
import { getCurrentUser, getReadingHistoryForUser } from '@/lib/supabase'
import { useRef } from "react"
import { getReadingHistory, getFollowedStories } from "@/lib/localStorageHelpers"
import type { Story } from "@/data/stories"

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
}

type SearchBarProps = {
  className?: string
  query: string
  setQuery: (v: string) => void
  searchOpen: boolean
  setSearchOpen: (v: boolean) => void
  debouncedQuery: string
  suggestions: Story[]
  activeGenreName: string
  filteredStoriesLength: number
}

function SearchBar({
  className,
  query,
  setQuery,
  searchOpen,
  setSearchOpen,
  debouncedQuery,
  suggestions,
  activeGenreName,
  filteredStoriesLength,
}: SearchBarProps) {
  // Keep this component stable (module-level) to avoid remounting the input on parent re-renders
  return (
    <div
      className={["relative w-full", className].filter(Boolean).join(" ")}
      onFocus={() => setSearchOpen(true)}
      onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
    >
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên truyện hoặc tác giả…"
          className="h-10 w-full rounded-lg border border-zinc-800/80 bg-zinc-950/30 pl-9 pr-9 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-amber-300/30 focus:ring-2 focus:ring-amber-300/10"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-zinc-800 bg-zinc-950/40 p-1.5 text-zinc-200 transition hover:bg-zinc-900/60"
            aria-label="Xoá tìm kiếm"
          >
            <XIcon className="size-3.5" />
          </button>
        ) : null}
      </div>

      {/* Dropdown: desktop only */}
      {searchOpen && debouncedQuery.trim() ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 hidden overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-sm sm:block">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2">
            <div className="text-xs text-zinc-400">
              Kết quả trong: {" "}
              <span className="font-semibold text-zinc-200">{activeGenreName}</span>
            </div>
            <div className="text-xs text-zinc-500">{filteredStoriesLength} truyện</div>
          </div>

          {suggestions.length ? (
            <div className="max-h-[360px] overflow-auto p-2">
                {suggestions.map((s) => (
                <Link
                  key={s.id}
                  to={`/truyen/${s.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="group flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-zinc-900/60"
                >
                    {/* cover: prefer resolved public url, fallback to data value */}
                    {(() => {
                      try {
                        const raw = s.coverImage ?? (s as any).cover_image ?? (s as any).cover ?? (s as any).cover_url ?? null
                        const resolved = resolveCoverUrl(raw as any)
                        if (import.meta.env.DEV) console.debug('[cover debug search]', s.title, 'raw:', raw, 'resolved:', resolved)
                        if (resolved) return <img src={resolved} alt={s.title} className="h-10 w-10 rounded-md object-cover" loading="lazy" />
                      } catch (e) {}
                      return <img src={s.coverImage} alt={s.title} className="h-10 w-10 rounded-md object-cover" loading="lazy" />
                    })()}
                  <div className="min-w-0">
                    <div className="line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-amber-200">{s.title}</div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{s.author ?? "Đang cập nhật"}</div>
                  </div>
                  <div className="ml-auto text-xs text-zinc-500">{s.chapters.length} ch</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-zinc-400">Không có kết quả phù hợp.</div>
          )}
        </div>
      ) : null}
    </div>
  )
}


export default function HomePage() {
  const featured = getStoryBySlug("dem-toi-bi-ga-len-nui")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<'none' | 'hot' | 'latest'>('none')
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // State for reading history and followed stories
  // readingHistory: mapped Story objects for UI list
  const [readingHistory, setReadingHistory] = useState<Story[]>([])
  // raw reading history items from localStorage (contains chapterSlug etc.)
  type ReadingHistoryItem = {
    storySlug: string
    storyTitle: string
    chapterSlug?: string
    chapterNumber?: number
    chapterTitle?: string
    lastRead?: number
    coverImage?: string
  }
  const [readingHistoryItems, setReadingHistoryItems] = useState<ReadingHistoryItem[]>([])
  const [followedStories, setFollowedStories] = useState<Story[]>([])

  useEffect(() => {
    setCurrentPage(1)
    const t = window.setTimeout(() => setDebouncedQuery(query), 150)
    return () => window.clearTimeout(t)
  }, [query, selectedGenre])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileMenuOpen])

  // Load reading history and followed stories from Supabase if logged in, otherwise localStorage
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const u = await getCurrentUser()
        if (u) {
          const remote = await getReadingHistoryForUser(u.id)
          if (!mounted) return
          if (remote && remote.length) {
            const mapped = remote.map((r: any) => ({ storySlug: r.story_slug, storyTitle: r.story_title, chapterSlug: r.chapter_slug, chapterNumber: r.chapter_number, chapterTitle: r.chapter_title, lastRead: r.last_read }))
            setReadingHistoryItems(mapped)
            const historyStories = mapped
              .map((item) => stories.find((s) => s.slug === item.storySlug))
              .filter((s): s is Story => s !== undefined)
            setReadingHistory(historyStories)
            // try to load followed stories from localStorage as fallback (can be synced later)
            const followedSlugs = getFollowedStories()
            const followedStoriesList = followedSlugs
              .map((slug) => stories.find((s) => s.slug === slug))
              .filter((s): s is Story => s !== undefined)
            setFollowedStories(followedStoriesList)
            return
          }
        }
      } catch (e) {
        // ignore and fallback to local
      }

      // fallback: localStorage
      const historyItems = getReadingHistory()
      const followedSlugs = getFollowedStories()

      // Map slugs to story objects
      const historyStories = historyItems
        .map((item) => stories.find((s) => s.slug === item.storySlug))
        .filter((s): s is Story => s !== undefined)

      const followedStoriesList = followedSlugs
        .map((slug) => stories.find((s) => s.slug === slug))
        .filter((s): s is Story => s !== undefined)

      if (!mounted) return
      setReadingHistory(historyStories)
      // also keep raw items for "Đọc tiếp"
      setReadingHistoryItems(historyItems)
      setFollowedStories(followedStoriesList)
    }

    load()
    return () => { mounted = false }
  }, [])

  // try to fetch stories from supabase on mount and fallback to local fake data
  const [remoteStories, setRemoteStories] = useState<Story[] | null>(null)
  // keep loading/error but avoid unused variable errors by using them in UI below
  const [, setRemoteLoading] = useState(false)
  const [, setRemoteAttempted] = useState(false)
  const [, setRemoteError] = useState<string | null>(null)
  const fetchedOnce = useRef(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (fetchedOnce.current) return
      fetchedOnce.current = true
      setRemoteLoading(true)
      try {
        const fetched = await fetchStoriesFromSupabase()
        if (!mounted) return
        if (fetched && Array.isArray(fetched) && fetched.length) {
          // heuristic mapping: map supabase rows to Story shape
          const mapped: Story[] = fetched.map((r: any) => ({
            id: r.id ?? String(r.slug ?? Math.random()),
            slug: r.slug ?? r.id ?? r.title?.toLowerCase().replace(/\s+/g, '-') ?? 'untitled',
            title: r.title ?? r.name ?? 'Không tên',
            author: r.author ?? r.writer ?? r.author_name,
            coverImage: r.cover_image ?? r.coverImage ?? r.image ?? r.cover ?? r.cover_url ?? "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
            views: r.views ?? r.view_count ?? undefined,
            status: (r.status === 'completed' || r.status === 'full' || r.tags?.includes?.('Full')) ? 'completed' : 'ongoing',
            description: r.description ?? r.summary ?? r.desc ?? '',
            genreSlugs: r.genre_slugs ?? r.genres ?? r.genre ?? [],
            updatedAt: r.updated_at ?? r.updatedAt ?? new Date().toISOString(),
            chapters: Array.isArray(r.chapters) ? r.chapters.map((c: any, i: number) => ({ number: c.number ?? (i+1), slug: c.slug ?? `chuong-${c.number ?? (i+1)}`, title: c.title ?? `Chương ${c.number ?? (i+1)}`, content: Array.isArray(c.content) ? c.content : [c.content ?? ''], publishedAt: c.published_at ?? c.publishedAt ?? new Date().toISOString(), id: c.id ?? (c.slug ?? `chuong-${c.number ?? (i+1)}`), createdAt: c.created_at ?? c.createdAt })) : [],
            tags: r.tags ?? (typeof r.tags === 'string' ? r.tags.split(',').map((t: string) => t.trim()) : undefined),
          }))
           // filter only published stories (status !== 'draft')
           setRemoteStories(mapped.filter(s => String(s.status ?? '').toLowerCase() !== 'draft'))
        }
      } catch (e: any) {
        setRemoteError(String(e?.message ?? e))
      } finally {
        if (mounted) {
          setRemoteLoading(false)
          // mark that we've attempted fetching remote data so loading text hides
          setRemoteStories((s) => s ?? [])
          setRemoteAttempted(true)
        }
      }
    })()
    return () => { mounted = false }
  }, [])

  const baseStories = remoteStories && remoteStories.length ? remoteStories : stories

  // ensure only published stories appear on homepage
  

  const filteredStories = useMemo(() => {
    const q = normalizeText(debouncedQuery)
    let list = baseStories.filter((s) => {
      if (selectedGenre && !s.genreSlugs?.includes?.(selectedGenre)) return false
      if (!q) return true
      const title = normalizeText(s.title)
      const author = normalizeText(s.author ?? "")
      return title.includes(q) || author.includes(q)
    })

    // apply sort
    if (sortMode === 'hot') {
      list = [...list].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    } else if (sortMode === 'latest') {
      list = [...list].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    }

    return list
  }, [debouncedQuery, selectedGenre])

  const hot = useMemo(() => {
    return [...filteredStories]
      .sort((a, b) => b.chapters.length - a.chapters.length)
      .slice(0, 6)
  }, [filteredStories])

  const ranking = useMemo(() => {
    return [...stories]
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 6)
  }, [])

  const latest = useMemo(() => {
    return [...filteredStories]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [filteredStories, currentPage])

  const suggestions = useMemo(() => {
    const q = normalizeText(debouncedQuery)
    if (!q) return []
    return [...filteredStories]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5)
  }, [debouncedQuery, filteredStories])

  const activeGenreName = selectedGenre
    ? genres.find((g) => g.slug === selectedGenre)?.name ?? selectedGenre
    : "Tất cả"

  // use the module-level SearchBar component defined above to avoid remounting

  return (
    <MainLayout
      headerRight={<SearchBar
        className="hidden sm:block"
        query={query}
        setQuery={setQuery}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        debouncedQuery={debouncedQuery}
        suggestions={suggestions}
        activeGenreName={activeGenreName}
        filteredStoriesLength={filteredStories.length}
      />}
      headerBottom={<SearchBar
        query={query}
        setQuery={setQuery}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        debouncedQuery={debouncedQuery}
        suggestions={suggestions}
        activeGenreName={activeGenreName}
        filteredStoriesLength={filteredStories.length}
      />}
      >
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:py-10">
        {/* remote loading state intentionally hidden (no plain text shown) */}
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant="outline"
            className="border-zinc-800 bg-zinc-950/40 text-zinc-100 transition hover:-translate-y-0.5 hover:bg-zinc-900/50 active:translate-y-0"
            onClick={() => setMobileMenuOpen(true)}
          >
            <SlidersHorizontalIcon />
            Menu / Lọc
          </Button>

          <button
            type="button"
            onClick={() => { setSortMode(sortMode === 'hot' ? 'none' : 'hot') }}
            className={[
              "rounded-lg border px-3 py-2 text-xs font-semibold transition",
              sortMode === 'hot' ? 'border-amber-300/40 bg-amber-300/10 text-amber-200' : 'border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-900/50',
            ].join(' ')}
          >
            Hot
          </button>
          <button
            type="button"
            onClick={() => { setSortMode(sortMode === 'latest' ? 'none' : 'latest') }}
            className={[
              "rounded-lg border px-3 py-2 text-xs font-semibold transition",
              sortMode === 'latest' ? 'border-amber-300/40 bg-amber-300/10 text-amber-200' : 'border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-900/50',
            ].join(' ')}
          >
            Mới
          </button>
        </div>

        {/* Search empty state: show when user searched but no results found */}
        {debouncedQuery.trim() && filteredStories.length === 0 ? (
          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 text-center text-sm text-zinc-400">
            <div className="text-lg font-semibold text-zinc-100">Không tìm thấy kết quả</div>
            <p className="mt-2">Không tìm thấy truyện nào khớp với "{debouncedQuery}". Thử đổi từ khoá hoặc thể loại.</p>
            <div className="mt-4 flex justify-center">
              <button onClick={() => { setQuery(''); setDebouncedQuery(''); setSelectedGenre(null) }} className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200">Xóa tìm kiếm</button>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <main className="space-y-7 sm:space-y-8">
          {featured ? (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-[160px_1fr] sm:items-start">
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="h-[160px] w-full rounded-xl object-cover sm:h-[220px]"
                  loading="lazy"
                />
                <div>
                  <p className="text-xs font-medium tracking-wide text-amber-300">
                    Gợi ý hôm nay
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-300">
                    {featured.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-300">
                    {featured.genreSlugs.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-1"
                      >
                        {genres.find((x) => x.slug === g)?.name ?? g}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                    <Link
                      to={`/truyen/${featured.slug}`}
                      className="rounded-lg bg-amber-300 px-4 py-2 text-center text-sm font-semibold text-zinc-950 hover:bg-amber-200"
                    >
                      Xem truyện
                    </Link>
                    <Link
                      to={`/doc-truyen/${featured.slug}/${featured.chapters[0]?.slug ?? "chuong-1"}`}
                      className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-center text-sm font-semibold text-zinc-100 hover:bg-zinc-900/50"
                    >
                      Đọc từ đầu
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {/* New section: Đang đọc gần đây */}
          {/* New section: Đọc tiếp (show most recent reading history) */}
          {readingHistoryItems.length > 0 && (() => {
            const recent = readingHistoryItems[0]
            // require storySlug and chapterSlug to render 'Đọc tiếp'
            if (!recent || !recent.storySlug || !recent.chapterSlug) return null
            const href = `/doc-truyen/${recent.storySlug}/${recent.chapterSlug}`
            return (
              <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6">
                <h2 className="mb-4 text-2xl font-semibold text-zinc-100">Đọc tiếp</h2>
                <div className="flex items-center gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-100">{recent.storyTitle}</div>
                    <div className="text-sm text-zinc-400">{recent.chapterTitle ?? "Tiếp tục đọc"}</div>
                  </div>
                  <div className="ml-auto">
                    <Link to={href} className="rounded-lg border border-zinc-800 bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200">
                      Đọc tiếp{recent.chapterNumber ? ` chương ${recent.chapterNumber}` : ""}
                    </Link>
                  </div>
                </div>
              </section>
            )
          })()}
          {readingHistory.length > 0 && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6">
              <h2 className="mb-4 text-2xl font-semibold text-zinc-100">Đang đọc gần đây</h2>
              <div className="space-y-4">
                {readingHistory.map((story) => (
                  <Link
                    key={story.slug}
                    to={`/doc-truyen/${story.slug}/${story.chapters[0]?.slug ?? "chuong-1"}`}
                    className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-zinc-200 hover:bg-zinc-900/50"
                  >
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className="h-12 w-12 rounded-md object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{story.title}</div>
                      <div className="truncate text-sm text-zinc-400">
                        {story.chapters[0]?.title ?? ""}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* New section: Truyện đang theo dõi */}
          {followedStories.length > 0 && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6">
              <h2 className="mb-4 text-2xl font-semibold text-zinc-100">Truyện đang theo dõi</h2>
              <div className="space-y-4">
                {followedStories.map((story) => (
                  <Link
                    key={story.slug}
                    to={`/truyen/${story.slug}`}
                    className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-zinc-200 hover:bg-zinc-900/50"
                  >
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className="h-12 w-12 rounded-md object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{story.title}</div>
                      <div className="truncate text-sm text-zinc-400">
                        {story.author ?? ""}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section id="hot" className="scroll-mt-24">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="text-2xl font-semibold sm:text-3xl">Truyện Hot</h2>
              <span className="text-xs text-zinc-500">
                (Fake data — phase sau sẽ nối API)
              </span>
            </div>

            {hot.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                {hot.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 text-center">
                <div className="text-lg font-semibold text-zinc-100">
                  Không có truyện phù hợp
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Thử đổi thể loại hoặc từ khoá tìm kiếm.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGenre(null)
                    setQuery("")
                  }}
                  className="mt-4 inline-flex rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
                >
                  Xem tất cả
                </button>
              </div>
            )}
          </section>

          {/* New section: Truyện mới cập nhật (list with status, views, chapter count) */}
          <section id="new-updates" className="scroll-mt-24 rounded-2xl border border-zinc-800 bg-zinc-900/20">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="text-lg font-semibold sm:text-xl">Truyện mới cập nhật</h2>
              <span className="text-xs text-zinc-500">(Sắp xếp theo thời gian cập nhật)</span>
            </div>

            <div className="divide-y divide-zinc-800">
              {latest.length ? (
                latest.map((story) => {
                  const latestChapter = story.chapters.at(-1)
                  const chapterHref = latestChapter
                    ? `/doc-truyen/${story.slug}/${latestChapter.slug}`
                    : `/truyen/${story.slug}`

                  return (
                    <div
                      key={story.id}
                      className="grid grid-cols-[1fr_auto] items-start gap-3 px-4 py-3 text-sm transition hover:bg-zinc-900/30 sm:items-center sm:px-6"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/truyen/${story.slug}`}
                          className="line-clamp-1 font-medium text-zinc-100 hover:text-amber-200"
                        >
                          {story.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                          {story.status === "completed" ? (
                            <span className="rounded bg-emerald-400/15 px-2 py-0.5 font-semibold text-emerald-200">
                              Full
                            </span>
                          ) : (
                            <span className="rounded bg-sky-400/15 px-2 py-0.5 font-semibold text-sky-200">
                              Đang ra
                            </span>
                          )}
                          <span>{story.chapters.length} chương</span>
                          <span>{story.views ? `${story.views.toLocaleString()} lượt đọc` : "- lượt đọc"}</span>
                          <span className="line-clamp-1">{story.author ?? "Đang cập nhật"}</span>
                        </div>
                      </div>

                      <Link
                        to={chapterHref}
                        className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:-translate-y-0.5 hover:bg-zinc-900/50 active:translate-y-0"
                      >
                        {latestChapter
                          ? `Chương ${latestChapter.number}`
                          : "Chi tiết"}
                      </Link>
                    </div>
                  )
                })
              ) : (
                <div className="p-6 text-center text-sm text-zinc-400">Không có truyện nào khớp bộ lọc hiện tại.</div>
              )}
            </div>
          {/* Pagination for "Truyện mới cập nhật" */}
          {Math.ceil(filteredStories.length / itemsPerPage) > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1))
                  document.getElementById('new-updates')?.scrollIntoView({ behavior: 'smooth' })
                }}
                disabled={currentPage === 1}
                className={`rounded px-3 py-1 text-sm font-semibold ${currentPage === 1 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-zinc-900/40 text-zinc-100 hover:bg-zinc-900/60'}`}
              >
                Trước
              </button>

              <div className="text-sm text-zinc-300">Trang <span className="font-semibold text-zinc-100">{currentPage}</span> / {Math.ceil(filteredStories.length / itemsPerPage)}</div>

              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(Math.ceil(filteredStories.length / itemsPerPage), p + 1))
                  document.getElementById('new-updates')?.scrollIntoView({ behavior: 'smooth' })
                }}
                disabled={currentPage === Math.ceil(filteredStories.length / itemsPerPage)}
                className={`rounded px-3 py-1 text-sm font-semibold ${currentPage === Math.ceil(filteredStories.length / itemsPerPage) ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-zinc-900/40 text-zinc-100 hover:bg-zinc-900/60'}`}
              >
                Sau
              </button>
            </div>
          ) : null}
          </section>

          <section
            id="latest"
            className="scroll-mt-24 rounded-2xl border border-zinc-800 bg-zinc-900/20"
          >
            <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="text-lg font-semibold sm:text-xl">
                Mới cập nhật
              </h2>
              <span className="text-xs text-zinc-500">{filteredStories.length} truyện</span>
            </div>

            <div className="divide-y divide-zinc-800">
              {latest.length ? (
                latest.map((story) => {
                const latestChapter = story.chapters.at(-1)
                const chapterHref = latestChapter
                  ? `/doc-truyen/${story.slug}/${latestChapter.slug}`
                  : `/truyen/${story.slug}`

                return (
                  <div
                    key={story.id}
                    className="grid grid-cols-[1fr_auto] items-start gap-3 px-4 py-3 text-sm transition hover:bg-zinc-900/30 sm:items-center sm:px-6"
                  >
                    <div className="min-w-0">
                      <Link
                        to={`/truyen/${story.slug}`}
                        className="line-clamp-1 font-medium text-zinc-100 hover:text-amber-200"
                      >
                        {story.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                        {story.status === "completed" ? (
                          <span className="rounded bg-emerald-400/15 px-2 py-0.5 font-semibold text-emerald-200">
                            Full
                          </span>
                        ) : (
                          <span className="rounded bg-sky-400/15 px-2 py-0.5 font-semibold text-sky-200">
                            Đang ra
                          </span>
                        )}
                        {story.tags?.includes("NEW") ? (
                          <span className="rounded bg-fuchsia-400/15 px-2 py-0.5 font-semibold text-fuchsia-200">
                            New
                          </span>
                        ) : null}
                        <span className="line-clamp-1">
                          {story.author ?? "Đang cập nhật"}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={chapterHref}
                      className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:-translate-y-0.5 hover:bg-zinc-900/50 active:translate-y-0"
                    >
                      {latestChapter
                        ? `Chương ${latestChapter.number}`
                        : "Chi tiết"}
                    </Link>
                  </div>
                )
              })
              ) : (
                <div className="p-6 text-center text-sm text-zinc-400">
                  Không có truyện nào khớp bộ lọc hiện tại.
                </div>
              )}
            </div>
            {Math.ceil(filteredStories.length / itemsPerPage) > 1 ? (
              <div className="mt-4 flex justify-center">
                <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  {Array.from({ length: Math.ceil(filteredStories.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center border px-3 py-2 text-sm font-semibold focus:z-20 ${
                        page === currentPage
                          ? "border-amber-300 bg-amber-300 text-zinc-950"
                          : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            ) : null}
          </section>
        </main>

        <aside className="hidden space-y-6 lg:block">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 sm:p-5">
            <div className="mb-3 flex items-end justify-between gap-2">
              <h3 className="text-lg font-semibold">Bảng xếp hạng</h3>
              <span className="text-xs text-zinc-500">Top lượt đọc</span>
            </div>
            <div className="space-y-2 text-sm text-zinc-200">
              {ranking.map((s, i) => (
                <Link key={s.id} to={`/truyen/${s.slug}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-zinc-900/40">
                  <div className="w-6 text-xs font-semibold text-amber-300">#{i+1}</div>
                  <img src={s.coverImage} alt={s.title} className="h-10 w-10 rounded object-cover" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{s.title}</div>
                    <div className="truncate text-xs text-zinc-400">{s.views ? `${s.views.toLocaleString()} lượt đọc` : "- lượt đọc"}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 sm:p-5">
            <div className="mb-3 flex items-end justify-between gap-2">
              <h3 className="text-lg font-semibold">Thể loại</h3>
              <span className="text-xs text-zinc-500">{activeGenreName}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedGenre(null)}
              className={[
                "mb-3 w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold transition",
                selectedGenre === null
                  ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                  : "border-zinc-800 bg-zinc-950/30 text-zinc-200 hover:bg-zinc-900/40",
              ].join(" ")}
            >
              Tất cả
            </button>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-1">
              {genres.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGenre(g.slug)}
                  className={[
                    "rounded-lg border px-3 py-2 text-left transition hover:-translate-y-0.5 active:translate-y-0",
                    selectedGenre === g.slug
                      ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                      : "border-zinc-800 bg-zinc-950/30 text-zinc-200 hover:bg-zinc-900/40",
                  ].join(" ")}
                >
                  {g.name}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-500">Click để lọc theo thể loại. (Fake data)</p>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/40 to-zinc-900/10 p-4 sm:p-5">
            <h3 className="text-lg font-semibold">Mẹo đọc</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li>Chạm giữ thanh điều khiển ở trang đọc để đổi cỡ chữ.</li>
              <li>Trên mobile, nút “Trước/Sau” luôn nằm trong thanh sticky.</li>
            </ul>
          </section>
        </aside>
      </div>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Đóng menu"
          />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm border-r border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-100">Khám phá</h2>
              <button
                type="button"
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-2 text-zinc-100 hover:bg-zinc-900/50"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Đóng"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-6">
              <section>
                <h3 className="mb-3 text-sm font-semibold text-zinc-200">Thể loại</h3>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGenre(null)
                    setMobileMenuOpen(false)
                  }}
                  className={[
                    "mb-3 w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold transition",
                    selectedGenre === null
                      ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                      : "border-zinc-800 bg-zinc-900/30 text-zinc-200 hover:bg-zinc-900/50",
                  ].join(" ")}
                >
                  Tất cả
                </button>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {genres.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGenre(g.slug)}
                      className={[
                        "rounded-lg border px-3 py-2 text-left transition hover:-translate-y-0.5 active:translate-y-0",
                        selectedGenre === g.slug
                          ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                          : "border-zinc-800 bg-zinc-900/30 text-zinc-200 hover:bg-zinc-900/50",
                      ].join(" ")}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-zinc-500">Chạm để lọc.</p>
              </section>

              <section className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/40 to-zinc-900/10 p-4 sm:p-5">
                <h3 className="text-lg font-semibold">Mẹo đọc</h3>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li>Chạm giữ thanh điều khiển ở trang đọc để đổi cỡ chữ.</li>
                  <li>Trên mobile, nút “Trước/Sau” luôn nằm trong thanh sticky.</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </MainLayout>
  )
}