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

export default function AdminStoryCard({ story, coverSrc, categoryName, onPublishToggle, onEdit, onDelete, onChapters, viewHref, onCoverError }: Props) {
  const isDraft = story?.status === 'draft'
  const isCompleted = story?.status === 'completed'
  const isPaused = story?.status === 'paused'

  const statusLabel = isCompleted ? 'Full' : isPaused ? 'Tạm dừng' : 'Đang ra'

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="h-[96px] w-[72px] shrink-0 overflow-hidden rounded border border-zinc-800 bg-zinc-900/30">
          {coverSrc ? (
            <img src={coverSrc} alt={story?.title} onError={onCoverError} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-zinc-400">No cover</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-semibold leading-snug text-zinc-100 line-clamp-2">{story?.title}</div>
          <div className="mt-1 truncate text-xs text-zinc-400">{story?.author || 'Chưa có tác giả'}</div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-xs ${isCompleted ? 'bg-emerald-400/10 text-emerald-200' : 'bg-sky-400/10 text-sky-200'}`}>{statusLabel}</span>
            {isDraft ? (
              <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-300">Draft</span>
            ) : (
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200">Published</span>
            )}
            {categoryName ? <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-200">{categoryName}</span> : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={onPublishToggle} className={`rounded px-3 py-1.5 text-xs font-semibold ${isDraft ? 'bg-emerald-600 text-zinc-900 hover:bg-emerald-500' : 'bg-zinc-700 text-amber-300 hover:bg-zinc-600'}`}>{isDraft ? 'Publish' : 'Unpublish'}</button>
            <button type="button" onClick={onEdit} className="rounded px-3 py-1.5 text-xs font-semibold bg-sky-700 text-white hover:bg-sky-600">Edit</button>
            <button type="button" onClick={onDelete} className="rounded px-3 py-1.5 text-xs font-semibold bg-red-700 text-white hover:bg-red-600">Delete</button>
            <button type="button" onClick={onChapters} className="rounded px-3 py-1.5 text-xs font-semibold bg-indigo-700 text-white hover:bg-indigo-600">Chapters</button>
            <a href={viewHref} className="rounded px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-amber-300 hover:bg-amber-200">View</a>
          </div>
        </div>
      </div>
    </div>
  )
}
