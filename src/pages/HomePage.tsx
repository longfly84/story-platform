import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import StoryCard from "@/components/home/StoryCard"
import MainLayout from "@/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
import {
  genres,
  getStoryBySlug,
  stories,
} from "@/data/stories"
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

export default function HomePage() {
  const featured = getStoryBySlug("dem-toi-bi-ga-len-nui")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // State for reading history and followed stories
  const [readingHistory, setReadingHistory] = useState<Story[]>([])
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

  // Load reading history and followed stories from localStorage
  useEffect(() => {
    const historyItems = getReadingHistory()
    const followedSlugs = getFollowedStories()

    // Map slugs to story objects
    const historyStories = historyItems
      .map((item) => stories.find((s) => s.slug === item.storySlug))
      .filter((s): s is Story => s !== undefined)

    const followedStoriesList = followedSlugs
      .map((slug) => stories.find((s) => s.slug === slug))
      .filter((s): s is Story => s !== undefined)

    setReadingHistory(historyStories)
    setFollowedStories(followedStoriesList)
  }, [])

  const filteredStories = useMemo(() => {
    const q = normalizeText(debouncedQuery)
    return stories.filter((s) => {
      if (selectedGenre && !s.genreSlugs.includes(selectedGenre)) return false
      if (!q) return true
      const title = normalizeText(s.title)
      const author = normalizeText(s.author ?? "")
      const categories = s.genreSlugs.map((slug) => slug.toLowerCase())
      return title.includes(q) || author.includes(q) || categories.some((c) => c.includes(q))
    })
  }, [debouncedQuery, selectedGenre])

  // Cải thiện filter category thật: lọc theo thể loại có trong genres
  const filteredByCategory = useMemo(() => {
    if (!selectedGenre) return filteredStories
    return filteredStories.filter((story) => story.genreSlugs.includes(selectedGenre))
  }, [filteredStories, selectedGenre])

  const hot = useMemo(() => {
    return [...filteredStories]
      .sort((a, b) => b.chapters.length - a.chapters.length)
      .slice(0, 6)
  }, [filteredStories])

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

  // Section truyện nổi bật (ví dụ lấy 6 truyện HOT hoặc mới nhất)
  const featuredStories = useMemo(() => {
    return [...stories]
      .filter((s) => s.tags?.includes("HOT"))
      .slice(0, 6)
  }, [])

  // Section truyện mới cập nhật (ví dụ lấy 6 truyện mới nhất)
  const newUpdates = useMemo(() => {
    return [...stories]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 6)
  }, [])

  const SearchBar = ({ className }: { className?: string }) => (
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
              Kết quả trong:{" "}
              <span className="font-semibold text-zinc-200">
                {activeGenreName}
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              {filteredStories.length} truyện
      </div>
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
                  <img
                    src={s.coverImage}
                    alt={s.title}
                    className="h-10 w-10 rounded-md object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-amber-200">
                      {s.title}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                      {s.author ?? "Đang cập nhật"}
                    </div>
                  </div>
                  <div className="ml-auto text-xs text-zinc-500">
                    {s.chapters.length} ch
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-zinc-400">
              Không có kết quả phù hợp.
            </div>
          )}
        </div>
      ) : null}
    </div>
  )

  return (
    <MainLayout
      headerRight={<SearchBar className="hidden sm:block" />}
      headerBottom={<SearchBar />}
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6 lg:py-10">
        <div className="mb-4 flex items-center gap-2 lg:hidden">
          <Button
            variant="outline"
            className="border-zinc-800 bg-zinc-950/40 text-zinc-100 transition hover:-translate-y-0.5 hover:bg-zinc-900/50 active:translate-y-0"
            onClick={() => setMobileMenuOpen(true)}
          >
            <SlidersHorizontalIcon />
            Menu / Lọc
          </Button>

          <a
            href="#hot"
            className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:-translate-y-0.5 hover:bg-zinc-900/50 active:translate-y-0"
          >
            Hot
          </a>
          <a
            href="#latest"
            className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:-translate-y-0.5 hover:bg-zinc-900/50 active:translate-y-0"
          >
            Mới
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <main className="space-y-7 sm:space-y-8">
          {featured ? (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-[160px_1fr] sm:items-start">
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="h-[180px] w-full rounded-xl object-cover sm:h-[220px]"
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