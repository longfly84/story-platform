import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  stories: any[]
  categories: any[]
  loading: boolean
  error: string | null
  imageErrors: Record<string, boolean>
  resolveCoverUrl: (value?: string | null) => string | null | undefined
  setImageErrors: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void
  onTogglePublish: (story: any) => void | Promise<void>
  onDeleteStory: (id: number) => void | Promise<void>
  onOpenChapters: (slug: string, title?: string) => void | Promise<void>
}

const STORIES_PER_PAGE = 10

function getDateTimeValue(value: any) {
  if (!value) return 0

  const time = new Date(value).getTime()

  return Number.isFinite(time) ? time : 0
}

function formatDateTime(value: any) {
  if (!value) return 'Chưa rõ'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Chưa rõ'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getTargetChapterCount(story: any) {
  const raw =
    story?.target_chapters ??
    story?.targetChapters ??
    story?.total_chapters ??
    story?.totalChapters ??
    story?.planned_chapters ??
    story?.plannedChapters ??
    story?.chapter_target ??
    story?.chapterTarget ??
    null

  const value = Number(raw)

  return Number.isFinite(value) && value > 0 ? value : null
}

function getCurrentChapterCount(story: any) {
  const raw =
    story?._chapter_count ??
    story?.chapter_count ??
    story?.chapterCount ??
    story?.chapters_count ??
    story?.chaptersCount ??
    story?.chapter_total ??
    story?.chapterTotal ??
    null

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw
  }

  if (Array.isArray(story?.chapters)) {
    return story.chapters.length
  }

  const value = Number(raw)

  return Number.isFinite(value) && value >= 0 ? value : 0
}

function getLatestChapterNumber(story: any) {
  const raw =
    story?._latest_chapter_number ??
    story?.latest_chapter_number ??
    story?.latestChapterNumber ??
    story?.last_chapter_number ??
    story?.lastChapterNumber ??
    null

  const value = Number(raw)

  return Number.isFinite(value) && value > 0 ? value : null
}

function getCompletionLabel(story: any) {
  const raw =
    story?.completion_status ??
    story?.completionStatus ??
    story?.story_status ??
    story?.storyStatus ??
    story?.progress_status ??
    story?.progressStatus ??
    story?.is_completed ??
    story?.isCompleted ??
    story?.completed ??
    null

  if (typeof raw === 'boolean') {
    return raw ? 'Full' : 'Chưa hoàn thành'
  }

  const text = String(raw || '').trim()
  const normalized = text.toLowerCase()

  if (
    normalized === 'full' ||
    normalized === 'completed' ||
    normalized === 'complete' ||
    normalized === 'finished' ||
    normalized === 'done' ||
    normalized === 'hoàn thành' ||
    normalized === 'hoan thanh'
  ) {
    return 'Full'
  }

  if (
    normalized === 'ongoing' ||
    normalized === 'writing' ||
    normalized === 'draft' ||
    normalized === 'unfinished' ||
    normalized === 'chưa hoàn thành' ||
    normalized === 'chua hoan thanh'
  ) {
    return 'Chưa hoàn thành'
  }

  return 'Chưa hoàn thành'
}

function getStatusLabel(story: any) {
  return story?.status === 'draft' ? 'Draft' : 'Published'
}

function getChapterDisplay(story: any) {
  const currentCount = getCurrentChapterCount(story)
  const targetCount = getTargetChapterCount(story)
  const latestChapterNumber = getLatestChapterNumber(story)

  if (targetCount) {
    return `${currentCount} / ${targetCount}`
  }

  if (latestChapterNumber && latestChapterNumber !== currentCount) {
    return `${currentCount} chương, mới nhất chương ${latestChapterNumber}`
  }

  return `${currentCount}`
}

export default function StoriesSection({
  stories,
  categories,
  loading,
  error,
  imageErrors,
  resolveCoverUrl,
  setImageErrors,
  onTogglePublish,
  onDeleteStory,
  onOpenChapters,
}: Props) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const q = query.trim().toLowerCase()

  const sortedStories = useMemo(() => {
    return [...stories].sort((a: any, b: any) => {
      const aTime = getDateTimeValue(a?.created_at || a?.updated_at)
      const bTime = getDateTimeValue(b?.created_at || b?.updated_at)

      if (aTime !== bTime) return bTime - aTime

      return Number(b?.id || 0) - Number(a?.id || 0)
    })
  }, [stories])

  const filtered = useMemo(() => {
    if (!q) return sortedStories

    return sortedStories.filter((story: any) => {
      const inTitle = String(story.title || '').toLowerCase().includes(q)
      const inAuthor = String(story.author || '').toLowerCase().includes(q)
      const inSlug = String(story.slug || '').toLowerCase().includes(q)
      const inStatus = String(story.status || '').toLowerCase().includes(q)
      const inCompletion = String(getCompletionLabel(story)).toLowerCase().includes(q)
      const inGenres =
        Array.isArray(story.genres) && story.genres.join(' ').toLowerCase().includes(q)

      return inTitle || inAuthor || inSlug || inStatus || inCompletion || inGenres
    })
  }, [q, sortedStories])

  const totalPages = Math.max(1, Math.ceil(filtered.length / STORIES_PER_PAGE))

  const pagedStories = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const start = (safePage - 1) * STORIES_PER_PAGE

    return filtered.slice(start, start + STORIES_PER_PAGE)
  }, [filtered, page, totalPages])

  useEffect(() => {
    setPage(1)
  }, [query])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  function getCoverSrc(story: any) {
    const rawCover =
      story?.cover_image ??
      story?.coverImage ??
      story?.cover_url ??
      story?.coverUrl ??
      story?.image_url ??
      story?.imageUrl ??
      story?.image ??
      story?.cover ??
      null

    return resolveCoverUrl(rawCover) ?? undefined
  }

  function getCategoryName(story: any) {
    const categorySlug = Array.isArray(story.genres) ? story.genres[0] : ''
    if (!categorySlug) return ''

    return categories.find((category: any) => category.slug === categorySlug)?.name ?? categorySlug
  }

  async function handleDeleteClick(story: any) {
    const choice = window.prompt(
      [
        `Bạn muốn làm gì với truyện: ${story.title}?`,
        '',
        'Nhập 1 để XÓA CẢ TRUYỆN.',
        'Nhập 2 để MỞ DANH SÁCH CHƯƠNG để sửa/xóa chương.',
        '',
        'Nhập số 1 hoặc 2:',
      ].join('\n')
    )

    if (choice === null) return

    const normalized = choice.trim()

    if (normalized === '2') {
      await onOpenChapters(story.slug, story.title)
      return
    }

    if (normalized !== '1') {
      alert('Lựa chọn không hợp lệ. Nhập 1 hoặc 2.')
      return
    }

    const ok = window.confirm(
      `Xóa cả truyện "${story.title}"?\n\nNếu chỉ muốn sửa/xóa chương thì chọn 2.`
    )

    if (!ok) return

    await onDeleteStory(story.id)
  }

  function getVisiblePageNumbers() {
    const pages: number[] = []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)

    for (let item = start; item <= end; item += 1) {
      pages.push(item)
    }

    return pages
  }

  return (
    <section className="mb-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Stories</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Quản lý truyện, public/draft, chương và trang xem public.
        </p>
      </div>

      <div className="mt-3">
        <input
          placeholder="Tìm truyện theo tên, tác giả, slug..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-md border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-300/70"
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span>
          Hiển thị {pagedStories.length} / {filtered.length} truyện
          {q ? ` cho từ khóa "${query}"` : ''}
        </span>

        <span className="text-zinc-600">Sắp xếp: truyện mới tạo lên đầu</span>
      </div>

      {loading ? <div className="mt-3 text-sm text-zinc-400">Loading...</div> : null}
      {error ? <div className="mt-3 text-sm text-red-400">{error}</div> : null}

      <ul className="mt-3 grid grid-cols-1 gap-3">
        {pagedStories.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-400">Không tìm thấy truyện phù hợp.</div>
        ) : (
          pagedStories.map((story: any) => {
            const coverSrc = getCoverSrc(story)
            const coverErrored = imageErrors?.[story?.id]
            const categoryName = getCategoryName(story)
            const isDraft = story?.status === 'draft'
            const isPublished = story?.status !== 'draft'
            const statusLabel = getStatusLabel(story)
            const completionLabel = getCompletionLabel(story)
            const chapterDisplay = getChapterDisplay(story)
            const createdAt = formatDateTime(story?.created_at)
            const updatedAt = formatDateTime(story?.updated_at)

            return (
              <li key={story.id}>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 transition hover:border-zinc-700 hover:bg-zinc-950/60">
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px] lg:items-start">
                    <div className="flex min-w-0 gap-3">
                      <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                        {coverSrc && !coverErrored ? (
                          <img
                            src={coverSrc}
                            alt={story.title}
                            className="h-full w-full object-cover"
                            onError={() =>
                              setImageErrors((prev) => ({
                                ...(prev || {}),
                                [story.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
                            No cover
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-zinc-100">
                          {story.title}
                        </h3>

                        <div className="mt-1 text-sm text-zinc-400">
                          {story.author || 'Không rõ tác giả'}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={[
                              'rounded px-2 py-1 text-xs font-semibold',
                              completionLabel === 'Full'
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-zinc-800 text-zinc-300',
                            ].join(' ')}
                          >
                            {completionLabel}
                          </span>

                          <span
                            className={[
                              'rounded px-2 py-1 text-xs font-semibold',
                              isPublished
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-amber-950/70 text-amber-300',
                            ].join(' ')}
                          >
                            {statusLabel}
                          </span>

                          {categoryName ? (
                            <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200">
                              {categoryName}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onTogglePublish(story)}
                            className="rounded bg-zinc-700 px-3 py-2 text-sm font-semibold text-amber-300 hover:bg-zinc-600"
                          >
                            {isDraft ? 'Publish' : 'Unpublish'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              window.location.href = `/admin/stories/${story.id}/edit`
                            }}
                            className="rounded bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDeleteClick(story)}
                            className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
                          >
                            Delete
                          </button>

                          <button
                            type="button"
                            onClick={() => void onOpenChapters(story.slug, story.title)}
                            className="rounded bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500"
                          >
                            Chapters
                          </button>

                          <Link
                            to={`/truyen/${story.slug}?from=admin`}
                            className="rounded bg-amber-300 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-black/20 p-2.5 lg:min-h-28">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                        <div>
                          <div className="text-zinc-500">Ngày tạo</div>
                          <div className="mt-0.5 whitespace-nowrap font-semibold text-zinc-200">
                            {createdAt}
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500">Cập nhật</div>
                          <div className="mt-0.5 whitespace-nowrap font-semibold text-zinc-200">
                            {updatedAt}
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500">Public</div>
                          <div
                            className={[
                              'mt-0.5 inline-flex rounded px-2 py-0.5 font-semibold',
                              isPublished
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-amber-950/70 text-amber-300',
                            ].join(' ')}
                          >
                            {statusLabel}
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500">Tiến độ</div>
                          <div
                            className={[
                              'mt-0.5 inline-flex rounded px-2 py-0.5 font-semibold',
                              completionLabel === 'Full'
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-zinc-800 text-zinc-300',
                            ].join(' ')}
                          >
                            {completionLabel}
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500">Chương</div>
                          <div className="mt-0.5 text-base font-bold leading-none text-amber-300">
                            {chapterDisplay}
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500">ID</div>
                          <div className="mt-0.5 max-w-[90px] truncate font-mono text-[10px] text-zinc-400">
                            #{story.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 pl-1 text-[11px] text-zinc-600">
                  <span>{isDraft ? 'Draft' : 'Published'}</span>

                  {story.slug ? (
                    <Link
                      className="text-zinc-500 hover:text-amber-300"
                      to={`/truyen/${story.slug}?from=admin`}
                    >
                      /{story.slug}
                    </Link>
                  ) : null}
                </div>
              </li>
            )
          })
        )}
      </ul>

      {filtered.length > STORIES_PER_PAGE ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 hover:border-amber-300"
          >
            Trước
          </button>

          {getVisiblePageNumbers().map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={[
                'rounded-lg px-3 py-2 text-sm font-semibold',
                pageNumber === page
                  ? 'bg-amber-300 text-zinc-950'
                  : 'border border-zinc-700 text-zinc-100 hover:border-amber-300',
              ].join(' ')}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 hover:border-amber-300"
          >
            Sau
          </button>

          <span className="ml-2 text-xs text-zinc-500">
            Trang {page}/{totalPages}
          </span>
        </div>
      ) : null}
    </section>
  )
}