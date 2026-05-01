type Props = {
  catName: string
  catSlug: string
  catDesc: string
  selectedCategoryId: string
  categories: any[]
  onCatNameChange: (value: string) => void
  setCatSlug: (value: string) => void
  setCatDesc: (value: string) => void
  setSelectedCategoryId: (value: string) => void
  createCategory: () => void | Promise<void>
  deleteCategory: (id: string, slug: string) => void | Promise<void>
  clearForm: () => void
}

export default function CategoryManager({
  catName,
  catSlug,
  catDesc,
  selectedCategoryId,
  categories,
  onCatNameChange,
  setCatSlug,
  setCatDesc,
  setSelectedCategoryId,
  createCategory,
  deleteCategory,
  clearForm,
}: Props) {
  const selected = categories.find((x: any) => x.id === selectedCategoryId)

  return (
    <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">Category Management</h2>
      <div className="mt-3 grid gap-2">
        <input className="rounded bg-zinc-900/60 p-2 text-zinc-100" placeholder="Name" value={catName} onChange={(e) => onCatNameChange(e.target.value)} />
        <input className="rounded bg-zinc-900/60 p-2 text-zinc-100" placeholder="Slug" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
        <textarea className="rounded bg-zinc-900/60 p-2 text-zinc-100" placeholder="Description optional" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void createCategory()} className="rounded bg-emerald-500 px-4 py-2 text-zinc-950">Create Category</button>
          <button type="button" onClick={clearForm} className="rounded bg-zinc-800 px-4 py-2 text-zinc-100">Clear</button>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs text-zinc-400">Chọn thể loại</label>
        <select className="mt-1 w-full rounded bg-zinc-900/60 p-2 text-zinc-100" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
          <option value="">-- Chọn category --</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {selected ? (
          <div className="mt-2 rounded border border-zinc-800 bg-zinc-950/40 p-3">
            <div className="font-medium text-zinc-100">{selected.name}</div>
            <div className="text-xs text-zinc-400">{selected.slug}</div>
            <div className="mt-1 text-xs text-zinc-400">{selected.description}</div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Xác nhận xoá?')) {
                    void deleteCategory(selected.id, selected.slug)
                    setSelectedCategoryId('')
                  }
                }}
                className="rounded bg-red-700 px-2 py-1 text-xs text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-xs text-zinc-400">Chưa có thể loại được chọn.</div>
        )}
      </div>
    </section>
  )
}
