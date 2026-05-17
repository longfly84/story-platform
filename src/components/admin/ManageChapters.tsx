type Props = {
  selectedStoryForChapters: string | null
  chapters: any[]
  editingChapterId: any | null
  editChapterData: any
  setEditingChapterId: (value: any | null) => void
  setEditChapterData: (value: any) => void
  startEditChapter: (chapter: any) => void
  saveEditChapter: (e: any) => void | Promise<void>
  deleteChapter: (id: any, storySlug?: string) => void | Promise<void>
  onClose: () => void
}

export default function ManageChapters({
  selectedStoryForChapters,
  chapters,
  editingChapterId,
  editChapterData,
  setEditingChapterId,
  setEditChapterData,
  startEditChapter,
  saveEditChapter,
  deleteChapter,
  onClose,
}: Props) {
  if (!selectedStoryForChapters) return null

  return (
    <section id="manage-chapters" className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Manage Chapters</h2>
          <div className="text-xs text-zinc-400">Story: {selectedStoryForChapters}</div>
        </div>
        <button type="button" onClick={onClose} className="rounded bg-zinc-800 px-3 py-1 text-xs text-white">Close</button>
      </div>

      <div className="mt-3 space-y-2">
        {chapters.length ? chapters.map((c: any) => (
          <div key={c.id} className="rounded border border-zinc-800 bg-zinc-950/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-medium text-zinc-100">{c.title}</div>
                <div className="mt-0.5 text-xs text-amber-300">Chương {c.chapter_number ?? 'chưa có số'}</div>
                <div className="truncate text-xs text-zinc-400">{c.slug}</div>
                <div className="mt-1 line-clamp-2 text-xs text-zinc-500">{c.content}</div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => startEditChapter(c)} className="rounded bg-zinc-800 px-2 py-1 text-xs text-white">Edit</button>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm('Xác nhận xoá chương này?')) return
                    void deleteChapter(c.id, selectedStoryForChapters)
                  }}
                  className="rounded bg-red-700 px-2 py-1 text-xs text-white"
                >
                  Delete
                </button>
              </div>
            </div>

            {editingChapterId === c.id && editChapterData ? (
              <form onSubmit={saveEditChapter} className="mt-3 grid gap-2">
                <input className="rounded bg-zinc-900/60 p-2 text-zinc-100" value={editChapterData.title ?? ''} onChange={(e) => setEditChapterData({ ...editChapterData, title: e.target.value })} />
                <input className="rounded bg-zinc-900/60 p-2 text-zinc-100" value={editChapterData.slug ?? ''} onChange={(e) => setEditChapterData({ ...editChapterData, slug: e.target.value })} />
                <input type="number" min={1} className="rounded bg-zinc-900/60 p-2 text-zinc-100" value={editChapterData.chapter_number ?? ''} onChange={(e) => setEditChapterData({ ...editChapterData, chapter_number: Number(e.target.value) || null })} />
                <textarea className="min-h-72 rounded bg-zinc-900/60 p-2 text-zinc-100" value={editChapterData.content ?? ''} onChange={(e) => setEditChapterData({ ...editChapterData, content: e.target.value })} />
                <div className="flex gap-2">
                  <button type="submit" className="rounded bg-amber-300 px-3 py-1 text-zinc-900">Save</button>
                  <button type="button" onClick={() => { setEditingChapterId(null); setEditChapterData(null) }} className="rounded bg-zinc-800 px-3 py-1 text-white">Cancel</button>
                </div>
              </form>
            ) : null}
          </div>
        )) : (
          <div className="text-sm text-zinc-400">Chưa có chương.</div>
        )}
      </div>
    </section>
  )
}
