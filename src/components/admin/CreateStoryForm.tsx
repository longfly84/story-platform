type Props = {
  newStory: any
  setNewStory: (updater: any) => void
  newVisibility: 'published' | 'draft'
  setNewVisibility: (value: 'published' | 'draft') => void
  newCoverFile: File | null
  setNewCoverFile: (file: File | null) => void
  uploadingCover: boolean
  storySlugEdited: boolean
  setStorySlugEdited: (value: boolean) => void
  createCategorySlug: string
  setCreateCategorySlug: (value: string) => void
  categories: any[]
  generateSlug: (input: string) => string
  onSubmit: (e: any) => void | Promise<void>
}

export default function CreateStoryForm({
  newStory,
  setNewStory,
  newVisibility,
  setNewVisibility,
  newCoverFile,
  setNewCoverFile,
  uploadingCover,
  storySlugEdited,
  setStorySlugEdited,
  createCategorySlug,
  setCreateCategorySlug,
  categories,
  generateSlug,
  onSubmit,
}: Props) {
  return (
    <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">Create Story</h2>
      <form onSubmit={onSubmit} className="mt-3 grid gap-3">
        <input
          className="rounded bg-zinc-900/60 p-2 text-zinc-100 outline-none focus:ring-1 focus:ring-amber-300"
          placeholder="Title"
          value={newStory.title}
          onChange={(e) => {
            const val = e.target.value
            setNewStory((s: any) => ({ ...s, title: val, slug: storySlugEdited ? s.slug : generateSlug(val) }))
          }}
        />
        <input
          className="rounded bg-zinc-900/60 p-2 text-zinc-100 outline-none focus:ring-1 focus:ring-amber-300"
          placeholder="Slug"
          value={newStory.slug}
          onChange={(e) => {
            setNewStory({ ...newStory, slug: e.target.value })
            setStorySlugEdited(true)
          }}
        />
        <input
          className="rounded bg-zinc-900/60 p-2 text-zinc-100 outline-none focus:ring-1 focus:ring-amber-300"
          placeholder="Author"
          value={newStory.author}
          onChange={(e) => setNewStory({ ...newStory, author: e.target.value })}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs text-zinc-400">
            Thể loại
            <select className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" value={createCategorySlug} onChange={(e) => setCreateCategorySlug(e.target.value)}>
              <option value="">-- Chưa có thể loại --</option>
              {categories.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </label>

          <label className="grid gap-1 text-xs text-zinc-400">
            Visibility
            <select className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" value={newVisibility} onChange={(e) => setNewVisibility(e.target.value as any)}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>

          <label className="grid gap-1 text-xs text-zinc-400">
            Trạng thái
            <select className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" value={newStory.status} onChange={(e) => setNewStory({ ...newStory, status: e.target.value })}>
              <option value="ongoing">Đang ra</option>
              <option value="completed">Hoàn thành</option>
              <option value="paused">Tạm dừng</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-xs text-zinc-400">
          Cover image optional
          <input type="file" accept="image/*" onChange={(e) => setNewCoverFile(e.target.files?.[0] ?? null)} />
        </label>
        {newCoverFile ? (
          <img src={URL.createObjectURL(newCoverFile)} alt="preview" className="h-24 w-auto rounded" />
        ) : null}

        <textarea
          className="min-h-28 rounded bg-zinc-900/60 p-2 text-zinc-100 outline-none focus:ring-1 focus:ring-amber-300"
          placeholder="Description"
          value={newStory.description}
          onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
        />
        <button className="rounded bg-amber-300 px-4 py-2 font-medium text-zinc-900">
          {uploadingCover ? 'Uploading cover…' : 'Create Story'}
        </button>
      </form>
    </section>
  )
}
