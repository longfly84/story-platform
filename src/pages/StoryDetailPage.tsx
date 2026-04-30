import { Link, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { Helmet } from "react-helmet"

import MainLayout from "@/layouts/MainLayout"
import { getStoryBySlug } from "@/data/stories"
import { fetchStoryBySlug } from "@/lib/supabase"
import { StarIcon, EyeIcon, ClockIcon } from "lucide-react"
import { followStory, unfollowStory, isStoryFollowed, getReadingHistory } from "@/lib/localStorageHelpers"
import { formatCount } from "@/lib/formatters"

export default function StoryDetailPage() {
  const { slug } = useParams()
  const story = slug ? getStoryBySlug(slug) : undefined

  const [rating, setRating] = useState(4.5)
  // keep a reactive followed flag so the button updates immediately
  const [followed, setFollowed] = useState(false)

  useEffect(() => {
    if (story) {
      setRating(parseFloat((Math.random() * 2 + 3).toFixed(1)))
      setFollowed(isStoryFollowed(story.slug))
    }
  }, [story])

  // try to load story from Supabase and merge into local story (fallback if not found)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!slug) return
      const s = await fetchStoryBySlug(slug)
      if (!mounted) return
      if (s && story) {
        // minimal: merge remote fields onto local story object for display
        Object.assign(story, s as Partial<typeof story>)
      }
    })()
    return () => { mounted = false }
  }, [slug, story])

  // reading history entry for this story (if any)
  const readingEntry = story ? getReadingHistory().find((h) => h.storySlug === story.slug) : undefined
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
      </Helmet>
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full rounded-lg object-cover sm:w-72 sm:h-auto"
              loading="lazy"
            />
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-zinc-100">{story.title}</h1>
                <p className="mt-2 text-sm text-zinc-400">{story.author ?? "Đang cập nhật"}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <StarIcon className="size-4 text-amber-400" />
                    <span>{rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="size-4" />
                    <span>{views ? `${formatCount(views)} lượt đọc` : "- lượt đọc"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="size-4" />
                    <span>{statusLabel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500">•</span>
                    <span>{chapterCount} chương</span>
                  </div>
                </div>
                <p className="mt-4 text-zinc-300">{story.description}</p>
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Link
                  to={`/doc-truyen/${story.slug}/${story.chapters[0]?.slug ?? "chuong-1"}`}
                  className="inline-block w-full rounded-lg bg-amber-300 px-4 py-2 text-center text-sm font-semibold text-zinc-950 hover:bg-amber-200 sm:w-auto"
                >
                  Đọc từ đầu
                </Link>

                {readingEntry ? (
                  <Link
                    to={`/doc-truyen/${readingEntry.storySlug}/${readingEntry.chapterSlug}`}
                    className="inline-block w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-center text-sm font-semibold text-zinc-100 hover:bg-zinc-900/50 sm:w-auto"
                  >
                    Đọc tiếp{readingEntry.chapterNumber ? ` chương ${readingEntry.chapterNumber}` : ""}
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    if (!story) return
                    if (followed) {
                      unfollowStory(story.slug)
                      setFollowed(false)
                    } else {
                      followStory(story.slug)
                      setFollowed(true)
                    }
                  }}
                  className="inline-block w-full rounded-lg border border-zinc-800 bg-zinc-950/30 px-4 py-2 text-center text-sm font-semibold text-zinc-100 hover:bg-zinc-900/50 sm:w-auto"
                >
                  {followed ? "Bỏ theo dõi" : "Theo dõi truyện"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </MainLayout>
    </>
  )
}