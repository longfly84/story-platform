type Props = {
  stories: any[]
  newChapter: any
  setNewChapter: (value: any) => void
  chapterSlugEdited: boolean
  setChapterSlugEdited: (value: boolean) => void
  generateSlug: (input: string) => string
  onSubmit: (e: any) => void | Promise<void>
}

export default function CreateChapterForm({ stories, newChapter, setNewChapter, chapterSlugEdited, setChapterSlugEdited, generateSlug, onSubmit }: Props) {
  return (
    <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">Create Chapter</h2>
      <form onSubmit={onSubmit} className="mt-3 grid gap-2">
        <label className="text-xs text-zinc-400">Chọn truyện</label>
        <select className="rounded bg-zinc-900/60 p-2 text-zinc-100" value={newChapter.storySlug} onChange={(e) => setNewChapter({ ...newChapter, storySlug: e.target.value })}>
          <option value="">-- Chọn truyện --</option>
          {stories.map((s: any) => (
            <option key={s.id} value={s.slug}>{s.title}</option>
          ))}
        </select>
        <input
          className="rounded bg-zinc-900/60 p-2 text-zinc-100"
          placeholder="Chapter title"
          value={newChapter.title}
          onChange={(e) => {
            const val = e.target.value
            setNewChapter((c: any) => ({ ...c, title: val, slug: chapterSlugEdited ? c.slug : generateSlug(val) }))
          }}
        />
        <input
          className="rounded bg-zinc-900/60 p-2 text-zinc-100"
          placeholder="Chapter slug"
          value={newChapter.slug}
          onChange={(e) => {
            setNewChapter({ ...newChapter, slug: e.target.value })
            setChapterSlugEdited(true)
          }}
        />
        <textarea className="min-h-48 rounded bg-zinc-900/60 p-2 text-zinc-100" placeholder="Content" value={newChapter.content} onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })} />
        <input type="number" className="rounded bg-zinc-900/60 p-2 text-zinc-100" value={newChapter.chapter_number} onChange={(e) => setNewChapter({ ...newChapter, chapter_number: Number(e.target.value) })} />
        <button className="rounded bg-amber-300 px-4 py-2 text-zinc-900">Create Chapter</button>
      </form>
    </section>
  )
}
