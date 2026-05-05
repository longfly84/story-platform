type Props = {
  story: any
  coverSrc?: string | null
  categoryName?: string | null
  onPublishToggle: () => void | Promise<void>
  onEdit: () => void
  onDelete: () => void
  onChapters: () => void
  viewHref: string
  onCoverError?: () => void
}

function formatAdminDate(value?: string | null) {
  if (!value) return '--'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '--'

  const time = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const day = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return `${time} ${day}`
}

function getStoryChapterCount(story: any) {
  const raw =
    story?.chapter_count ??
    story?.chapterCount ??
    story?.chapters_count ??
    story?.chaptersCount ??
    story?.chapter_total ??
    story?.chapterTotal ??
    story?.current_chapters ??
    story?.currentChapters ??
    story?.chapters?.length ??
    0

  const count = Number(raw)

  return Number.isFinite(count) && count >= 0 ? count : 0
}

function getStoryTargetChapterCount(story: any, chapterCount: number) {
  const raw =
    story?.total_chapters ??
    story?.totalChapters ??
    story?.planned_chapters ??
    story?.plannedChapters ??
    story?.target_chapters ??
    story?.targetChapters ??
    story?.factory_total_chapters ??
    story?.factoryTotalChapters ??
    story?.chapter_target ??
    story?.chapterTarget ??
    story?.expected_chapters ??
    story?.expectedChapters ??
    chapterCount

  const count = Number(raw)

  if (!Number.isFinite(count) || count <= 0) {
    return chapterCount
  }

  return Math.max(chapterCount, count)
}

export default function AdminStoryCard({
  story,
  coverSrc,
  categoryName,
  onPublishToggle,
  onEdit,
  onDelete,
  onChapters,
  viewHref,
  onCoverError,
}: Props) {
  const isDraft = story?.status === 'draft'
  const isCompleted = story?.status === 'completed'
  const isPaused = story?.status === 'paused'

  const statusLabel = isCompleted ? 'Full' : isPaused ? 'Tạm dừng' : 'Đang ra'

  const chapterCount = getStoryChapterCount(story)
  const targetChapterCount = getStoryTargetChapterCount(story, chapterCount)
  const chapterDisplay = `${chapterCount} / ${targetChapterCount}`

  const createdLabel = formatAdminDate(story?.created_at ?? story?.createdAt)
  const updatedLabel = formatAdminDate(story?.updated_at ?? story?.updatedAt)

  const storyId = String(story?.id ?? '--')
  const shortStoryId =
    storyId.length > 16 ? `${storyId.slice(0, 13)}...` : storyId

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
          <div className="h-[96px] w-[72px] shrink-0 overflow-hidden rounded border border-zinc-800 bg-zinc-900/30">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={story?.title}
                onError={onCoverError}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-zinc-400">
                No cover
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-semibold leading-snug text-zinc-100 line-clamp-2">
              {story?.title}
            </div>

            <div className="mt-1 truncate text-xs text-zinc-400">
              {story?.author || 'Chưa có tác giả'}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-xs ${
                  isCompleted
                    ? 'bg-emerald-400/10 text-emerald-200'
                    : 'bg-sky-400/10 text-sky-200'
                }`}
              >
                {statusLabel}
              </span>

              {isDraft ? (
                <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-300">
                  Draft
                </span>
              ) : (
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200">
                  Published
                </span>
              )}

              {categoryName ? (
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-200">
                  {categoryName}
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onPublishToggle}
                className={`rounded px-3 py-1.5 text-xs font-semibold ${
                  isDraft
                    ? 'bg-emerald-600 text-zinc-900 hover:bg-emerald-500'
                    : 'bg-zinc-700 text-amber-300 hover:bg-zinc-600'
                }`}
              >
                {isDraft ? 'Publish' : 'Unpublish'}
              </button>

              <button
                type="button"
                onClick={onEdit}
                className="rounded bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="rounded bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={onChapters}
                className="rounded bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600"
              >
                Chapters
              </button>

              <a
                href={viewHref}
                className="rounded bg-amber-300 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-amber-200"
              >
                View
              </a>
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 rounded-lg border border-zinc-800 bg-black/20 p-3 lg:w-[220px]">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <div className="text-[11px] text-zinc-500">Ngày tạo</div>
              <div className="mt-1 text-xs font-semibold text-zinc-100">
                {createdLabel}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-zinc-500">Cập nhật</div>
              <div className="mt-1 text-xs font-semibold text-zinc-100">
                {updatedLabel}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-zinc-500">Public</div>
              <div className="mt-1">
                {isDraft ? (
                  <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-semibold text-yellow-300">
                    Draft
                  </span>
                ) : (
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                    Published
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-zinc-500">Tiến độ</div>
              <div className="mt-1">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-200'
                      : 'bg-sky-500/10 text-sky-200'
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-zinc-500">Chương</div>
              <div className="mt-1 text-base font-bold text-yellow-300">
                {chapterDisplay}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-zinc-500">ID</div>
              <div className="mt-1 truncate text-[11px] font-semibold text-zinc-300">
                #{shortStoryId}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}