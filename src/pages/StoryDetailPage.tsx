import { Link, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { Helmet } from "react-helmet"

import MainLayout from '@/layouts/MainLayout'
import { getStoryBySlug } from '@/data/stories'
import { fetchStoryBySlug, fetchChaptersByStorySlug } from '@/lib/supabase'
import { resolveCoverUrl } from '@/lib/supabase'
import { StarIcon, EyeIcon } from "lucide-react"
import { getReadingHistory, isStoryFollowed, followStory, unfollowStory } from "@/lib/localStorageHelpers"
import { getCurrentUser, getUserFollows, addUserFollow, removeUserFollow } from '@/lib/supabase'
import ChapterList from '@/components/ChapterList'
import { trackPageView } from '@/lib/analytics/trackView'
import { formatCount } from "@/lib/formatters"

export default function StoryDetailPage() {
  const { slug } = useParams()
  const [story, setStory] = useState<any>(slug ? getStoryBySlug(slug) : undefined)

  const [rating, setRating] = useState(4.5)
  // followed state intentionally not used in detail (kept minimal)

  useEffect(() => {
    if (story) {
      setRating(parseFloat((Math.random() * 2 + 3).toFixed(1)))
    }
  }, [story])

  // try to load story + chapters from Supabase (fallback to local fake data)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!slug) return
      try {
        const s = await fetchStoryBySlug(slug)
        if (!mounted) return
        if (s) {
          // if remote story found, replace local story and fetch chapters
          setStory((prev: any) => ({ ...(prev || {}), ...s }))
          try {
            // track page view for remote story once
            if (s?.id) void trackPageView({ path: (typeof window !== 'undefined' && window.location.pathname) ? window.location.pathname : '/', storySlug: s.slug, userId: null })
          } catch (e) {}
          // try to load chapters by story slug
          try {
            const ch = await fetchChaptersByStorySlug(slug)
            if (!mounted) return
            if (Array.isArray(ch) && ch.length) {
              setStory((prev: any) => ({ ...(prev || {}), chapters: ch.map((r:any)=>({ number: r.number, slug: r.slug, id: r.id ?? r.slug, title: r.title, content: r.content ?? r.body ?? r.text, publishedAt: r.published_at ?? r.created_at })) }))
            }
          } catch (e) {
            // ignore chapter load errors
          }
        }
      } catch (e) {
        // ignore and keep fake data
      }
    })()
    return () => { mounted = false }
  }, [slug])

  // reading history entry for this story (if any)
  const readingEntryLocal = story ? getReadingHistory().find((h) => h.storySlug === story.slug) : undefined
  // follow state (sync with Supabase when logged in, fallback to localStorage)
  const [isFollowed, setIsFollowed] = useState<boolean>(() => story ? isStoryFollowed(story.slug) : false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!story) return
      try {
        const u = await getCurrentUser()
        if (!mounted) return
        if (u) {
          const follows = await getUserFollows(u.id)
          if (!mounted) return
          setIsFollowed(follows.includes(story.slug))
        } else {
          setIsFollowed(isStoryFollowed(story.slug))
        }
      } catch (e) {
        // ignore and fallback
        setIsFollowed(isStoryFollowed(story.slug))
      }
    })()
    return () => { mounted = false }
  }, [story])
  const views = story?.views ?? undefined
  const statusLabel = story?.status === "completed" ? "Hoàn thành" : "Đang ra"
  const chapterCount = story?.chapters.length ?? 0

  if (!story) {
    return (
      <MainLayout>
        <main className="mx-auto max-w-5xl px-4 py-10">
          <Helmet>
            <title>Không tìm thấy truyện - Story Platform</title>
            <meta name="description" content="Slug không hợp lệ hoặc chưa có trong fake data." />
          </Helmet>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6">
            <h1 className="text-2xl font-semibold">Không tìm thấy truyện</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Slug không hợp lệ hoặc chưa có trong fake data.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
            >
              Về trang chủ
            </Link>
          </div>
        </main>
      </MainLayout>
    )
  }

  return (
    <>
      <Helmet>
        <title>{story.title} - Đọc Truyện</title>
        <meta name="description" content={story.description ?? `${story.title} - đọc truyện online.`} />
        <meta property="og:title" content={story.title ?? 'Story'} />
        <meta property="og:description" content={story.description ?? ''} />
        <meta property="og:image" content={story.coverImage ?? (story as any).cover_image ?? ''} />
        {/* JSON-LD structured data for Book */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Book",
          name: story.title ?? undefined,
          author: story.author ? { "@type": "Person", name: story.author } : undefined,
          description: story.description ?? undefined,
          image: story.coverImage ?? (story as any).cover_image ?? undefined,
          genre: story.genreSlugs && story.genreSlugs.length ? story.genreSlugs : (story.tags ?? undefined),
          url: (typeof window !== 'undefined' && window.location.href) ? window.location.href : undefined,
        })}</script>
      </Helmet>
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="breadcrumb" className="mb-4 text-sm">
            <Link to="/" className="text-zinc-400 hover:underline">Trang chủ</Link>
            <span className="mx-2 text-zinc-500">/</span>
            <span className="text-zinc-300">{story.title}</span>
          </nav>
          {/* show back-to-admin when ?from=admin */}
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('from') === 'admin' ? (
            <div className="mb-3">
              <Link to="/admin" className="text-sm text-amber-300 hover:underline">← Quay lại Admin</Link>
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            <div>
              {(() => {
                const raw = story.cover_url ?? story.coverImage ?? (story as any).cover_image ?? (story as any).cover ?? null
                const resolved = resolveCoverUrl(raw)
                if (import.meta.env.DEV) console.log('[cover-debug]', { title: story.title, cover_url: story.cover_url, resolvedCoverUrl: resolved })
                if (resolved) {
                  return <img src={resolved} alt={story.title} className="w-full rounded-lg object-cover shadow-lg" style={{ aspectRatio: '3/4' }} loading="lazy" onError={(e)=>{ (e.target as any).style.display='none' }} />
                }
                return <div className="w-full rounded-lg bg-zinc-900/20 flex h-[300px] items-center justify-center text-zinc-400">No cover</div>
              })()}
              <div className="mt-4 space-y-2">
                <div className="text-xs text-zinc-400">{story.author ?? 'Đang cập nhật'}</div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-1"><StarIcon className="size-4 text-amber-400" /> <span>{rating}</span></div>
                  <div className="flex items-center gap-1"><EyeIcon className="size-4" /> <span>{views ? `${formatCount(views)} lượt đọc` : '- lượt đọc'}</span></div>
                </div>
                <div className="mt-2 text-xs text-zinc-400">{statusLabel} • {chapterCount} chương</div>
              </div>
              <div className="mt-4 flex flex-col gap-3 px-1">
                <Link to={`/doc-truyen/${story.slug}/${story.chapters[0]?.slug ?? 'chuong-1'}`} className="block rounded bg-amber-300 px-4 py-3 text-center text-sm font-semibold text-zinc-950 hover:bg-amber-200">Đọc từ đầu</Link>
                <Link to={`/doc-truyen/${story.slug}/${story.chapters.at(-1)?.slug ?? 'chuong-1'}`} className="block rounded border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-center text-sm font-semibold text-zinc-100 hover:bg-zinc-900/50">Đọc chương mới nhất</Link>
                {readingEntryLocal ? <Link to={`/doc-truyen/${readingEntryLocal.storySlug}/${readingEntryLocal.chapterSlug}`} className="block rounded border border-zinc-800 bg-zinc-950/30 px-4 py-3 text-center text-sm font-semibold text-zinc-100 hover:bg-zinc-900/50">Đọc tiếp</Link> : null}
                <button
                  type="button"
                  onClick={async () => {
                    if (!story) return
                    const u = await getCurrentUser()
                    if (u) {
                      // toggle follow via remote
                      const follows = await getUserFollows(u.id)
                      const currently = follows.includes(story.slug)
                      if (currently) {
                        // remove
                        try { await removeUserFollow(u.id, story.slug) } catch {}
                      } else {
                        try { await addUserFollow(u.id, story.slug) } catch {}
                      }
                      // optimistic local toggle
                      setIsFollowed(!currently)
                    } else {
                      // fallback localStorage
                      if (isStoryFollowed(story.slug)) {
                        unfollowStory(story.slug)
                        setIsFollowed(false)
                      } else {
                        followStory(story.slug)
                        setIsFollowed(true)
                      }
                    }
                  }}
                  className="mt-2 rounded border border-zinc-800 bg-zinc-950/20 px-4 py-2 text-center text-sm font-semibold text-zinc-100 hover:bg-zinc-900/50"
                >
                  {isFollowed ? 'Bỏ theo dõi' : 'Theo dõi'}
                </button>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-zinc-100">{story.title}</h1>
              <p className="mt-3 text-zinc-300 whitespace-pre-line">{story.description}</p>

              {/* Chapter list */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-3">Danh sách chương</h3>
                <ChapterList chapters={story.chapters} storySlug={story.slug} />
              </div>
            </div>
          </div>
        </main>
      </MainLayout>
    </>
  )
}