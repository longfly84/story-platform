import { Link, useParams } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { Helmet } from "react-helmet"

import MainLayout from '@/layouts/MainLayout'
import { getStoryBySlug } from '@/data/stories'
import { fetchStoryBySlug, fetchChaptersByStorySlug } from '@/lib/supabase'
import { resolveCoverUrl } from '@/lib/supabase'
import { StarIcon, EyeIcon } from "lucide-react"
import {
  getReadingHistory,
  isStoryFollowed,
  followStory,
  unfollowStory,
} from "@/lib/localStorageHelpers"
import {
  getCurrentUser,
  getUserFollows,
  addUserFollow,
  removeUserFollow,
} from '@/lib/supabase'
import { submitComment, getApprovedComments } from '@/lib/analytics/comments'
import { Textarea } from '@/components/ui/textarea'
import { getStoryViewCount } from '@/lib/analytics/viewStats'
import { formatCount } from "@/lib/formatters"

function cleanPublicChapterText(text?: string | null) {
  if (!text) return ''

  let cleaned = String(text)

  const cutPatterns = [
    '# BẢN PHÂN TÍCH KỸ THUẬT',
    'BẢN PHÂN TÍCH KỸ THUẬT',
    '=== THÔNG TIN TRUYỆN ĐỀ XUẤT ===',
    'THÔNG TIN TRUYỆN ĐỀ XUẤT',
    '=== KIỂM TRA TIẾN ĐỘ TRUYỆN ===',
    'KIỂM TRA TIẾN ĐỘ TRUYỆN',
    '=== BỘ NHỚ TRUYỆN ===',
    'BỘ NHỚ TRUYỆN',
    '=== KIỂM TRA BỐI CẢNH LIÊN TỤC ===',
    'KIỂM TRA BỐI CẢNH LIÊN TỤC',
    '=== KIỂM TRA NHÂN VẬT PHỤ ===',
    'KIỂM TRA NHÂN VẬT PHỤ',
    '=== KIỂM TRA LƯỢNG TIẾT LỘ ===',
    'KIỂM TRA LƯỢNG TIẾT LỘ',
    '=== THEO DÕI',
    'THEO DÕI LEO THANG XUNG ĐỘT',
  ]

  for (const pattern of cutPatterns) {
    const index = cleaned.toLowerCase().indexOf(pattern.toLowerCase())

    if (index >= 0) {
      cleaned = cleaned.slice(0, index)
    }
  }

  return cleaned
    .replace(/^#\s*BẢN ĐỌC CHO ĐỘC GIẢ\s*/i, '')
    .replace(/^BẢN ĐỌC CHO ĐỘC GIẢ\s*/i, '')
    .replace(/^#\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getChapterNumber(chapter: any, index: number) {
  const rawNumber = chapter?.chapter_number ?? chapter?.number
  const number = Number(rawNumber)

  if (Number.isFinite(number) && number > 0) return number

  return index + 1
}

function getChapterSlug(chapter: any, index: number) {
  return chapter?.slug || `chuong-${getChapterNumber(chapter, index)}`
}

function cleanChapterTitle(title?: string | null, chapterNumber?: number) {
  const rawTitle = String(title || '').trim()

  if (!rawTitle) return chapterNumber ? `Chương ${chapterNumber}` : 'Chương'

  const cleanedTitle = cleanPublicChapterText(rawTitle)

  const match = cleanedTitle.match(/^Chương\s*\d+\s*[—-]\s*(.+)$/i)

  if (match?.[1]) return match[1].trim()

  return cleanedTitle || (chapterNumber ? `Chương ${chapterNumber}` : 'Chương')
}

function getChapterPreview(chapter: any) {
  const source = chapter?.summary || chapter?.content || chapter?.body || chapter?.text || ''
  const cleaned = cleanPublicChapterText(source)

  if (!cleaned) return ''

  return cleaned.slice(0, 180)
}

export default function StoryDetailPage() {
  const { slug } = useParams()
  const [story, setStory] = useState<any>(slug ? getStoryBySlug(slug) : undefined)

  const [rating, setRating] = useState<number>(0)
  const [ratingCount, setRatingCount] = useState<number>(0)
  const [isFollowed, setIsFollowed] = useState<boolean>(() =>
    story ? isStoryFollowed(story.slug) : false
  )
  const [realViews, setRealViews] = useState<number | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentStatusMsg, setCommentStatusMsg] = useState<string | null>(null)

  const userLoggedIn = useMemo(() => {
    return !!(typeof window !== 'undefined' && getCurrentUser())
  }, [])

  const chapters = useMemo(() => {
    const rawChapters = Array.isArray(story?.chapters) ? story.chapters : []

    return [...rawChapters].sort((a: any, b: any) => {
      const aNumber = Number(a?.number ?? a?.chapter_number ?? 0)
      const bNumber = Number(b?.number ?? b?.chapter_number ?? 0)

      return aNumber - bNumber
    })
  }, [story?.chapters])

  const readingEntryLocal = story
    ? getReadingHistory().find((history) => history.storySlug === story.slug)
    : undefined

  const viewsToShow = realViews ?? story?.views ?? undefined
  const safeViewCount = typeof viewsToShow === 'number' ? viewsToShow : 0
  const statusLabel = story?.status === "completed" ? "Hoàn thành" : "Đang ra"
  const chapterCount = chapters.length
  const firstChapterSlug = chapters[0] ? getChapterSlug(chapters[0], 0) : 'chuong-1'
  const latestChapterSlug = chapters.length ? getChapterSlug(chapters[chapters.length - 1], chapters.length - 1) : 'chuong-1'

  useEffect(() => {
    if (!story) return

    const stats = story?.story_stats

    if (stats) {
      if (typeof stats.avg_rating === 'number') {
        setRating(parseFloat(stats.avg_rating.toFixed(1)))
      }

      if (typeof stats.rating_count === 'number') {
        setRatingCount(stats.rating_count)
      }
    }
  }, [story])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      if (!slug) return

      try {
        const remoteStory = await fetchStoryBySlug(slug)

        if (!mounted) return

        if (remoteStory) {
          setStory((prev: any) => ({
            ...(prev || {}),
            ...remoteStory,
          }))

          try {
            const remoteChapters = await fetchChaptersByStorySlug(slug)

            if (!mounted) return

            if (Array.isArray(remoteChapters) && remoteChapters.length) {
              setStory((prev: any) => {
                if (!prev) return prev

                return {
                  ...prev,
                  chapters: remoteChapters.map((chapter: any) => ({
                    number: chapter.chapter_number ?? chapter.number,
                    chapter_number: chapter.chapter_number ?? chapter.number,
                    slug: chapter.slug,
                    id: chapter.id ?? chapter.slug,
                    title: chapter.title,
                    summary: chapter.summary,
                    content: chapter.content ?? chapter.body ?? chapter.text,
                    publishedAt: chapter.published_at ?? chapter.created_at,
                  })),
                }
              })
            }
          } catch {
            // ignore chapter load errors
          }
        }
      } catch {
        // ignore and keep local fake data fallback
      }
    })()

    return () => {
      mounted = false
    }
  }, [slug])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      if (!story) return

      try {
        const user = await getCurrentUser()

        if (!mounted) return

        if (user) {
          const follows = await getUserFollows(user.id)

          if (!mounted) return

          setIsFollowed(follows.includes(story.slug))
        } else {
          setIsFollowed(isStoryFollowed(story.slug))
        }
      } catch {
        setIsFollowed(isStoryFollowed(story.slug))
      }
    })()

    return () => {
      mounted = false
    }
  }, [story])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      if (!story?.slug) return

      try {
        const count = await getStoryViewCount(story.slug)

        if (!mounted) return

        if (typeof count === 'number') {
          setRealViews(count)
        }
      } catch (error) {
        console.warn('[story-detail-get-views]', error)
      }

      try {
        const mod = await import('@/lib/analytics/trackView')

        if (typeof mod.trackPageView === 'function') {
          await mod.trackPageView({
            path: window.location.pathname,
            storySlug: story.slug,
          })
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[track-view-error]', error)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [story])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      if (!story?.slug) return

      try {
        const approvedComments = await getApprovedComments(story.slug)

        if (!mounted) return

        setComments(approvedComments || [])
      } catch {
        // ignore
      }
    })()

    return () => {
      mounted = false
    }
  }, [story])

  async function handleToggleFollow() {
    if (!story) return

    const user = await getCurrentUser()

    if (user) {
      const follows = await getUserFollows(user.id)
      const currentlyFollowed = follows.includes(story.slug)

      if (currentlyFollowed) {
        try {
          await removeUserFollow(user.id, story.slug)
        } catch {
          // ignore
        }
      } else {
        try {
          await addUserFollow(user.id, story.slug)
        } catch {
          // ignore
        }
      }

      setIsFollowed(!currentlyFollowed)
      return
    }

    if (isStoryFollowed(story.slug)) {
      unfollowStory(story.slug)
      setIsFollowed(false)
    } else {
      followStory(story.slug)
      setIsFollowed(true)
    }
  }

  async function handleSubmitComment() {
    if (!commentText.trim() || !story) return

    const result = await submitComment({
      storyId: story.slug,
      content: commentText.trim(),
    })

    if (result?.ok) {
      setCommentText('')
      setCommentStatusMsg('Bình luận đã gửi và đang chờ duyệt.')
    } else {
      setCommentStatusMsg('Lỗi khi gửi bình luận.')
    }

    setTimeout(() => setCommentStatusMsg(null), 4000)
  }

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

  const rawCover =
    story.cover_url ??
    story.coverImage ??
    story.cover_image ??
    story.cover ??
    null

  const resolvedCoverUrl = resolveCoverUrl(rawCover)

  return (
    <>
      <Helmet>
        <title>{story.title} - Đọc Truyện</title>
        <meta
          name="description"
          content={story.description ?? `${story.title} - đọc truyện online.`}
        />
        <meta property="og:title" content={story.title ?? 'Story'} />
        <meta property="og:description" content={story.description ?? ''} />
        <meta property="og:image" content={resolvedCoverUrl ?? ''} />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Book',
            name: story.title ?? undefined,
            author: story.author
              ? {
                  '@type': 'Person',
                  name: story.author,
                }
              : undefined,
            description: story.description ?? undefined,
            image: resolvedCoverUrl ?? undefined,
            genre:
              story.genreSlugs && story.genreSlugs.length
                ? story.genreSlugs
                : story.tags ?? undefined,
            url:
              typeof window !== 'undefined' && window.location.href
                ? window.location.href
                : undefined,
          })}
        </script>
      </Helmet>

      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="breadcrumb" className="mb-4 text-sm">
            <Link to="/" className="text-zinc-400 hover:underline">
              Trang chủ
            </Link>
            <span className="mx-2 text-zinc-500">/</span>
            <span className="text-zinc-300">{story.title}</span>
          </nav>

          {typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).get('from') === 'admin' ? (
            <div className="mb-3">
              <Link to="/admin" className="text-sm text-amber-300 hover:underline">
                ← Quay lại Admin
              </Link>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            <div>
              {resolvedCoverUrl ? (
                <img
                  src={resolvedCoverUrl}
                  alt={story.title}
                  className="w-full rounded-lg object-cover shadow-lg"
                  style={{ aspectRatio: '3/4' }}
                  loading="lazy"
                  onError={(event) => {
                    ;(event.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="flex h-[300px] w-full items-center justify-center rounded-lg bg-zinc-900/20 text-zinc-400">
                  No cover
                </div>
              )}

              <div className="mt-4 space-y-2">
                <div className="text-xs text-zinc-400">
                  {story.author ?? 'Đang cập nhật'}
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <StarIcon className="size-4 text-amber-400" />
                    {ratingCount > 0 ? (
                      <span>
                        {rating} · {ratingCount} đánh giá
                      </span>
                    ) : (
                      <span>Chưa có đánh giá</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <EyeIcon className="size-4" />
                    <span>{formatCount(safeViewCount)} lượt đọc</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-zinc-400">
                  {statusLabel} • {chapterCount} chương
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 px-1">
                <Link
                  to={`/doc-truyen/${story.slug}/${firstChapterSlug}`}
                  className="block rounded bg-amber-300 px-4 py-3 text-center text-sm font-semibold text-zinc-950 hover:bg-amber-200"
                >
                  Đọc từ đầu
                </Link>

                <Link
                  to={`/doc-truyen/${story.slug}/${latestChapterSlug}`}
                  className="block rounded border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-center text-sm font-semibold text-zinc-100 hover:bg-zinc-900/50"
                >
                  Đọc chương mới nhất
                </Link>

                {readingEntryLocal ? (
                  <Link
                    to={`/doc-truyen/${readingEntryLocal.storySlug}/${readingEntryLocal.chapterSlug}`}
                    className="block rounded border border-zinc-800 bg-zinc-950/30 px-4 py-3 text-center text-sm font-semibold text-zinc-100 hover:bg-zinc-900/50"
                  >
                    Đọc tiếp
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className="mt-2 rounded border border-zinc-800 bg-zinc-950/20 px-4 py-2 text-center text-sm font-semibold text-zinc-100 hover:bg-zinc-900/50"
                >
                  {isFollowed ? 'Bỏ theo dõi' : 'Theo dõi'}
                </button>
              </div>
            </div>

            <div>
              <h1 className="bg-gradient-to-r from-rose-200 via-amber-200 to-yellow-400 bg-clip-text text-4xl font-extrabold leading-tight text-transparent drop-shadow-[0_0_18px_rgba(251,191,36,0.16)]">
                {story.title}
              </h1>

              <div className="mt-4 max-w-3xl space-y-3 text-base leading-8 text-zinc-300">
                {(story.description || 'Chưa có mô tả truyện.')
                  .split('\n')
                  .filter(Boolean)
                  .map((line: string, index: number) => (
                    <p key={index}>{line}</p>
                  ))}
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-lg font-semibold text-zinc-100">
                  Danh sách chương
                </h3>

                <div className="space-y-3">
                  {chapters.length ? (
                    chapters.map((chapter: any, index: number) => {
                      const chapterNumber = getChapterNumber(chapter, index)
                      const chapterSlug = getChapterSlug(chapter, index)
                      const chapterTitle = cleanChapterTitle(chapter.title, chapterNumber)
                      const chapterPreview = getChapterPreview(chapter)

                      return (
                        <Link
                          key={chapter.id ?? chapter.slug ?? index}
                          to={`/doc-truyen/${story.slug}/${chapterSlug}`}
                          className="block rounded-lg border border-transparent p-3 transition hover:border-amber-300/40 hover:bg-zinc-900/40"
                        >
                          <div className="font-semibold text-zinc-100">
                            Chương {chapterNumber} — {chapterTitle}
                          </div>

                          {chapterPreview ? (
                            <div className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-400">
                              {chapterPreview}
                            </div>
                          ) : null}
                        </Link>
                      )
                    })
                  ) : (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/30 p-4 text-sm text-zinc-400">
                      Chưa có chương nào.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="mb-3 text-lg font-semibold text-zinc-100">Bình luận</h3>

                {userLoggedIn ? (
                  <div className="mb-3">
                    <Textarea
                      value={commentText}
                      onChange={(event: any) => setCommentText(event.target.value)}
                      placeholder="Viết bình luận..."
                    />

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="rounded bg-amber-300 px-3 py-2 text-zinc-950"
                        onClick={handleSubmitComment}
                      >
                        Gửi bình luận
                      </button>

                      {commentStatusMsg ? (
                        <div className="text-sm text-zinc-300">{commentStatusMsg}</div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-400">Đăng nhập để bình luận</div>
                )}

                <div className="mt-4">
                  {comments && comments.length > 0 ? (
                    <ul className="space-y-3">
                      {comments.map((comment: any) => (
                        <li key={comment.id} className="rounded border border-zinc-800 p-3">
                          <div className="text-sm font-semibold text-zinc-100">
                            {comment.author_name ?? (comment.user_id ? 'Người dùng' : 'Khách')}
                          </div>

                          <div className="mt-1 whitespace-pre-line text-sm text-zinc-300">
                            {comment.content}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-zinc-400">Chưa có bình luận nào.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </MainLayout>
    </>
  )
}