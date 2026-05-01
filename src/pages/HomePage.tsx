import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"

import StoryCard from "@/components/home/StoryCard"
import MainLayout from "@/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { genres, stories } from "@/data/stories"
import type { Story } from "@/data/stories"
import { fetchStoriesFromSupabase, resolveCoverUrl } from "@/lib/supabase"

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
}

function getCoverImage(row: any) {
  const raw = row?.cover_image ?? row?.coverImage ?? row?.cover ?? row?.image_url ?? row?.image ?? ""
  const resolved = resolveCoverUrl(raw)
  return resolved || raw || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80"
}

function isPublicStory(row: any) {
  const visibility = String(row?.visibility ?? "").toLowerCase()
  const status = String(row?.status ?? "").toLowerCase()

  if (visibility === "draft" || visibility === "unpublished" || visibility === "private") return false
  if (visibility === "published" || visibility === "public") return true
  if (status === "draft" || status === "unpublished" || status === "private") return false

  // Tạm thời cho hiện các truyện thật nếu không bị đánh dấu draft.
  // DB hiện đang dùng status lẫn cả "published" và "Đang ra".
  return true
}

function mapRemoteStory(row: any, index: number): Story {
  const rawGenres = row?.genres ?? row?.genreSlugs ?? row?.genre_slugs ?? row?.genre ?? []
  const genreSlugs = Array.isArray(rawGenres)
    ? rawGenres.filter(Boolean)
    : typeof rawGenres === "string" && rawGenres.trim()
      ? [rawGenres.trim()]
      : []

  const rawChapters = Array.isArray(row?.chapters) ? row.chapters : []
  const chapters = rawChapters.map((chapter: any, chapterIndex: number) => {
    const number = Number(chapter?.number ?? chapter?.chapter_number ?? chapterIndex + 1)
    const slug = chapter?.slug ?? `chuong-${number}`
    return {
      id: chapter?.id ?? slug,
      number,
      slug,
      title: chapter?.title ?? `Chương ${number}`,
      content: Array.isArray(chapter?.content) ? chapter.content : [chapter?.content ?? ""],
      publishedAt: chapter?.published_at ?? chapter?.publishedAt ?? chapter?.created_at ?? new Date().toISOString(),
      createdAt: chapter?.created_at ?? chapter?.createdAt,
    }
  })

  const normalizedStatus = String(row?.status ?? "").toLowerCase() === "completed" || String(row?.status ?? "").toLowerCase() === "full"
    ? "completed"
    : "ongoing"

  return {
    id: row?.id ?? row?.slug ?? `remote-${index}`,
    slug: row?.slug ?? `remote-${index}`,
    title: row?.title ?? row?.name ?? "Không tên",
    author: row?.author ?? row?.writer ?? row?.author_name ?? "Đang cập nhật",
    coverImage: getCoverImage(row),
    description: row?.description ?? row?.summary ?? row?.desc ?? "",
    genreSlugs,
    status: normalizedStatus as Story["status"],
    views: Number(row?.views ?? row?.view_count ?? 0),
    updatedAt: row?.updated_at ?? row?.updatedAt ?? row?.created_at ?? new Date().toISOString(),
    chapters,
    tags: Array.isArray(row?.tags)
      ? row.tags
      : typeof row?.tags === "string"
        ? row.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
        : [],
  } as Story
}

type SearchBarProps = {
  className?: string
  query: string
  setQuery: (value: string) => void
  searchOpen: boolean
  setSearchOpen: (value: boolean) => void
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
          onChange={(event) => setQuery(event.target.value)}
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

      {searchOpen && debouncedQuery.trim() ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 hidden overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-sm sm:block">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2">
            <div className="text-xs text-zinc-400">
              Kết quả trong: <span className="font-semibold text-zinc-200">{activeGenreName}</span>
            </div>
            <div className="text-xs text-zinc-500">{filteredStoriesLength} truyện</div>
          </div>

          {suggestions.length ? (
            <div className="max-h-[360px] overflow-auto p-2">
              {suggestions.map((story) => (
                <Link
                  key={story.id}
                  to={`/truyen/${story.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="group flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-zinc-900/60"
                >
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="h-10 w-10 rounded-md object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-amber-200">
                      {story.title}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                      {story.author ?? "Đang cập nhật"}
                    </div>
                  </div>
                  <div className="ml-auto text-xs text-zinc-500">{story.chapters.length} ch</div>
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

function LatestStoryRow({ story }: { story: Story }) {
  const latestChapter = story.chapters[story.chapters.length - 1]
  const chapterHref = latestChapter ? `/doc-truyen/${story.slug}/${latestChapter.slug}` : `/truyen/${story.slug}`

  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-3 px-4 py-3 text-sm transition hover:bg-zinc-900/30 sm:items-center sm:px-6">
      <div className="min-w-0">
        <Link to={`/truyen/${story.slug}`} className="line-clamp-1 font-medium text-zinc-100 hover:text-amber-200">
          {story.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          {story.status === "completed" ? (
            <span className="rounded bg-emerald-400/15 px-2 py-0.5 font-semibold text-emerald-200">Full</span>
          ) : (
            <span className="rounded bg-sky-400/15 px-2 py-0.5 font-semibold text-sky-200">Đang ra</span>
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
        {latestChapter ? `Chương ${latestChapter.number}` : "Chi tiết"}
      </Link>
    </div>
  )
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<"none" | "hot" | "latest">("none")
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [remoteStories, setRemoteStories] = useState<Story[]>([])
  const [remoteLoaded, setRemoteLoaded] = useState(false)

  const itemsPerPage = 5

  useEffect(() => {
    setCurrentPage(1)
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 150)
    return () => window.clearTimeout(timeout)
  }, [query, selectedGenre])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    let mounted = true

    async function loadRemoteStories() {
      try {
        const data = await fetchStoriesFromSupabase()
        if (import.meta.env.DEV) console.log("[home-stories-fetch]", { data })

        const mapped = Array.isArray(data)
          ? data
              .filter(isPublicStory)
              .map((row, index) => mapRemoteStory(row, index))
              .filter((story) => story.slug && story.title)
          : []

        if (import.meta.env.DEV) console.log("[home-real-stories]", mapped)
        if (mounted) setRemoteStories(mapped)
      } catch (error) {
        if (import.meta.env.DEV) console.error("[home-stories-fetch-error]", error)
        if (mounted) setRemoteStories([])
      } finally {
        if (mounted) setRemoteLoaded(true)
      }
    }

    loadRemoteStories()
    return () => {
      mounted = false
    }
  }, [])

  const baseStories = remoteStories.length > 0 ? remoteStories : stories
  const usingRemote = remoteStories.length > 0

  const filteredStories = useMemo(() => {
    const q = normalizeText(debouncedQuery)
    let list = baseStories.filter((story) => {
      if (selectedGenre && !story.genreSlugs?.includes(selectedGenre)) return false
      if (!q) return true
      return normalizeText(story.title).includes(q) || normalizeText(story.author ?? "").includes(q)
    })

    if (sortMode === "hot") {
      list = [...list].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    } else if (sortMode === "latest") {
      list = [...list].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
    }

    return list
  }, [baseStories, debouncedQuery, selectedGenre, sortMode])

  const featured = filteredStories[0] ?? baseStories[0]

  const hot = useMemo(() => {
    return [...filteredStories]
      .sort((a, b) => (b.views ?? b.chapters.length) - (a.views ?? a.chapters.length))
      .slice(0, 6)
  }, [filteredStories])

  const ranking = useMemo(() => {
    return [...baseStories]
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 6)
  }, [baseStories])

  const latest = useMemo(() => {
    return [...filteredStories]
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [filteredStories, currentPage])

  const suggestions = useMemo(() => {
    const q = normalizeText(debouncedQuery)
    if (!q) return []
    return filteredStories.slice(0, 5)
  }, [debouncedQuery, filteredStories])

  const activeGenreName = selectedGenre
    ? genres.find((genre) => genre.slug === selectedGenre)?.name ?? selectedGenre
    : "Tất cả"

  const pageCount = Math.max(1, Math.ceil(filteredStories.length / itemsPerPage))

  return (
    <MainLayout
      headerRight={(
        <SearchBar
          className="hidden sm:block"
          query={query}
          setQuery={setQuery}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          debouncedQuery={debouncedQuery}
          suggestions={suggestions}
          activeGenreName={activeGenreName}
          filteredStoriesLength={filteredStories.length}
        />
      )}
      headerBottom={(
        <SearchBar
          query={query}
          setQuery={setQuery}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          debouncedQuery={debouncedQuery}
          suggestions={suggestions}
          activeGenreName={activeGenreName}
          filteredStoriesLength={filteredStories.length}
        />
      )}
    >
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:py-10">
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
            onClick={() => setSortMode(sortMode === "hot" ? "none" : "hot")}
            className={[
              "rounded-lg border px-3 py-2 text-xs font-semibold transition",
              sortMode === "hot"
                ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                : "border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-900/50",
            ].join(" ")}
          >
            Hot
          </button>
          <button
            type="button"
            onClick={() => setSortMode(sortMode === "latest" ? "none" : "latest")}
            className={[
              "rounded-lg border px-3 py-2 text-xs font-semibold transition",
              sortMode === "latest"
                ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                : "border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-900/50",
            ].join(" ")}
          >
            Mới
          </button>
        </div>

        {debouncedQuery.trim() && filteredStories.length === 0 ? (
          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 text-center text-sm text-zinc-400">
            <div className="text-lg font-semibold text-zinc-100">Không tìm thấy kết quả</div>
            <p className="mt-2">Không tìm thấy truyện nào khớp với “{debouncedQuery}”.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setDebouncedQuery("")
                setSelectedGenre(null)
              }}
              className="mt-4 inline-flex rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
            >
              Xem tất cả
            </button>
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
                      {usingRemote ? "Truyện mới đăng" : "Gợi ý hôm nay"}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-300">
                      {featured.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-300">
                      {featured.genreSlugs.slice(0, 3).map((slug) => (
                        <span key={slug} className="rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-1">
                          {genres.find((genre) => genre.slug === slug)?.name ?? slug}
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

            <section id="hot" className="scroll-mt-24">
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="text-2xl font-semibold sm:text-3xl">Truyện Hot</h2>
                {!usingRemote && remoteLoaded ? (
                  <span className="text-xs text-zinc-500">(Fake data — chưa có truyện public thật)</span>
                ) : null}
              </div>

              {hot.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                  {hot.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 text-center text-sm text-zinc-400">
                  Không có truyện nào phù hợp.
                </div>
              )}
            </section>

            <section id="new-updates" className="scroll-mt-24 rounded-2xl border border-zinc-800 bg-zinc-900/20">
              <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3 sm:px-6 sm:py-4">
                <h2 className="text-lg font-semibold sm:text-xl">Truyện mới cập nhật</h2>
                <span className="text-xs text-zinc-500">{filteredStories.length} truyện</span>
              </div>

              <div className="divide-y divide-zinc-800">
                {latest.length ? latest.map((story) => <LatestStoryRow key={story.id} story={story} />) : (
                  <div className="p-6 text-center text-sm text-zinc-400">Không có truyện nào khớp bộ lọc hiện tại.</div>
                )}
              </div>

              {pageCount > 1 ? (
                <div className="mt-4 flex items-center justify-center gap-3 pb-4">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded bg-zinc-900/40 px-3 py-1 text-sm font-semibold text-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-500"
                  >
                    Trước
                  </button>
                  <div className="text-sm text-zinc-300">
                    Trang <span className="font-semibold text-zinc-100">{currentPage}</span> / {pageCount}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                    disabled={currentPage === pageCount}
                    className="rounded bg-zinc-900/40 px-3 py-1 text-sm font-semibold text-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-500"
                  >
                    Sau
                  </button>
                </div>
              ) : null}
            </section>

            <section id="latest" className="scroll-mt-24 rounded-2xl border border-zinc-800 bg-zinc-900/20">
              <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3 sm:px-6 sm:py-4">
                <h2 className="text-lg font-semibold sm:text-xl">Mới cập nhật</h2>
                <span className="text-xs text-zinc-500">{filteredStories.length} truyện</span>
              </div>
              <div className="divide-y divide-zinc-800">
                {latest.length ? latest.map((story) => <LatestStoryRow key={`latest-${story.id}`} story={story} />) : (
                  <div className="p-6 text-center text-sm text-zinc-400">Không có truyện nào khớp bộ lọc hiện tại.</div>
                )}
              </div>
            </section>
          </main>

          <aside className="hidden space-y-6 lg:block">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 sm:p-5">
              <div className="mb-3 flex items-end justify-between gap-2">
                <h3 className="text-lg font-semibold">Bảng xếp hạng</h3>
                <span className="text-xs text-zinc-500">Top lượt đọc</span>
              </div>
              <div className="space-y-2 text-sm text-zinc-200">
                {ranking.map((story, index) => (
                  <Link key={story.id} to={`/truyen/${story.slug}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-zinc-900/40">
                    <div className="w-6 text-xs font-semibold text-amber-300">#{index + 1}</div>
                    <img src={story.coverImage} alt={story.title} className="h-10 w-10 rounded object-cover" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{story.title}</div>
                      <div className="truncate text-xs text-zinc-400">
                        {story.views ? `${story.views.toLocaleString()} lượt đọc` : "- lượt đọc"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section id="categories" className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 sm:p-5">
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
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => setSelectedGenre(genre.slug)}
                    className={[
                      "rounded-lg border px-3 py-2 text-left transition hover:-translate-y-0.5 active:translate-y-0",
                      selectedGenre === genre.slug
                        ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                        : "border-zinc-800 bg-zinc-950/30 text-zinc-200 hover:bg-zinc-900/40",
                    ].join(" ")}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-zinc-500">Click để lọc theo thể loại.</p>
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
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Đóng menu"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-auto rounded-t-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Menu / Lọc</h3>
                <p className="mt-1 text-xs text-zinc-500">Chọn thể loại hoặc cách sắp xếp.</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2 text-zinc-200"
                aria-label="Đóng menu"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Sắp xếp</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["none", "Mặc định"],
                    ["hot", "Hot"],
                    ["latest", "Mới"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSortMode(value as "none" | "hot" | "latest")}
                      className={[
                        "rounded-lg border px-3 py-2 text-sm font-semibold",
                        sortMode === value
                          ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                          : "border-zinc-800 bg-zinc-900/30 text-zinc-200",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Thể loại</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGenre(null)}
                    className={[
                      "rounded-lg border px-3 py-2 text-left text-sm font-semibold",
                      selectedGenre === null
                        ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                        : "border-zinc-800 bg-zinc-900/30 text-zinc-200",
                    ].join(" ")}
                  >
                    Tất cả
                  </button>
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => setSelectedGenre(genre.slug)}
                      className={[
                        "rounded-lg border px-3 py-2 text-left text-sm font-semibold",
                        selectedGenre === genre.slug
                          ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                          : "border-zinc-800 bg-zinc-900/30 text-zinc-200",
                      ].join(" ")}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-amber-300 text-zinc-950 hover:bg-amber-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </MainLayout>
  )
}
