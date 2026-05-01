

type Props = {
  story: any
  coverSrc?: string | null
  categoryName?: string | null
  onPublishToggle: () => void | Promise<void>
  onEdit: () => void
  onDelete: () => void
  onChapters: () => void
  viewHref: string
}

export default function AdminStoryCard({ story, coverSrc, categoryName, onPublishToggle, onEdit, onDelete, onChapters, viewHref }: Props) {
  const isDraft = story?.status === 'draft'
  const isCompleted = story?.status === 'completed'

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 flex items-start gap-4">
      {coverSrc ? (
        <img src={coverSrc} alt={story?.title} className="w-[72px] h-[96px] object-cover rounded flex-shrink-0" />
      ) : (
        <div style={{ width: 72, height: 96 }} className="flex items-center justify-center rounded border bg-zinc-900/20 text-zinc-400 text-xs">No cover</div>
      )}

      <div className="flex-1 min-w-0">
        <div className="min-w-0">
          <div className="font-semibold text-zinc-100 line-clamp-2">{story?.title}</div>
          <div className="text-xs text-zinc-400 truncate">{story?.author ?? ''}</div>
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded ${isCompleted ? 'bg-emerald-400/10 text-emerald-200' : 'bg-sky-400/10 text-sky-200'}`}>{isCompleted ? 'Full' : 'Đang ra'}</span>
          {isDraft ? (
            <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300">Draft</span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-200">Published</span>
          )}
          {categoryName ? <span className="text-xs px-2 py-0.5 rounded bg-zinc-800/20 text-zinc-200">{categoryName}</span> : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={onPublishToggle} className="text-xs rounded px-2 py-1 bg-emerald-600 text-white">{isDraft ? 'Publish' : 'Unpublish'}</button>
          <button onClick={onEdit} className="text-xs rounded px-2 py-1 bg-zinc-900/20">Edit</button>
          <button onClick={onDelete} className="text-xs rounded px-2 py-1 bg-red-700 text-white">Delete</button>
          <button onClick={onChapters} className="text-xs rounded px-2 py-1 bg-zinc-900/20">Chapters</button>
          <a href={viewHref} className="text-xs text-amber-300 hover:underline">View</a>
        </div>
      </div>
    </div>
  )
}
