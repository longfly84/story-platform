import { useEffect, useMemo, useState } from 'react'
import { resolveCoverUrl, supabase, uploadCoverImage } from '@/lib/supabase'

const PLACEMENT_OPTIONS = [
  { value: 'home_sidebar', label: 'Trang chủ - sidebar' },
  { value: 'home_inline', label: 'Trang chủ - inline' },
  { value: 'chapter_inline_1', label: 'Trong chương - slot 1' },
  { value: 'chapter_inline_2', label: 'Trong chương - slot 2' },
  { value: 'chapter_inline_3', label: 'Trong chương - slot 3' },
  { value: 'chapter_inline', label: 'Trong chương - dự phòng' },
]

const CHAPTER_INLINE_PLACEMENTS = ['chapter_inline_1', 'chapter_inline_2', 'chapter_inline_3']

function getPlacementLabel(value: string) {
  return PLACEMENT_OPTIONS.find((item) => item.value === value)?.label || value
}

function normalizeAd(ad: any) {
  return {
    title: ad?.title ?? '',
    subtitle: ad?.subtitle ?? '',
    description: ad?.description ?? '',
    image_url: ad?.image_url ?? '',
    target_url: ad?.target_url ?? '',
    placement: ad?.placement ?? 'home_sidebar',
    priority: Number(ad?.priority ?? 0),
    is_active: Boolean(ad?.is_active ?? true),
  }
}

function getTopAdByPlacement(ads: any[], placement: string) {
  return [...ads]
    .filter((ad) => ad.is_active && ad.placement === placement)
    .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))[0]
}

export default function AdminAdsManager() {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<any>({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    target_url: '',
    placement: 'home_sidebar',
    priority: 0,
    is_active: true,
  })

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function load() {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('priority', { ascending: false })

      if (error) throw error

      setAds(data || [])
      setError(null)
    } catch (e: any) {
      console.warn('[admin-ads-load-error]', e)
      setError(String(e?.message ?? e))
      setAds([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const stats = useMemo(() => {
    const totalAds = ads.length
    const activeAds = ads.filter((ad) => ad.is_active).length
    const inactiveAds = totalAds - activeAds
    const homeSidebarAds = ads.filter((ad) => ad.placement === 'home_sidebar').length
    const homeInlineAds = ads.filter((ad) => ad.placement === 'home_inline').length
    const activeChapterInlineAds = ads.filter((ad) => {
      return ad.is_active && CHAPTER_INLINE_PLACEMENTS.includes(ad.placement)
    }).length

    return {
      totalAds,
      activeAds,
      inactiveAds,
      homeSidebarAds,
      homeInlineAds,
      activeChapterInlineAds,
    }
  }, [ads])

  const slotPreview = useMemo(() => {
    return [
      {
        label: 'Slot 1',
        placement: 'chapter_inline_1',
        ad: getTopAdByPlacement(ads, 'chapter_inline_1'),
      },
      {
        label: 'Slot 2',
        placement: 'chapter_inline_2',
        ad: getTopAdByPlacement(ads, 'chapter_inline_2'),
      },
      {
        label: 'Slot 3',
        placement: 'chapter_inline_3',
        ad: getTopAdByPlacement(ads, 'chapter_inline_3'),
      },
    ]
  }, [ads])

  function resetForm() {
    setEditing(null)
    setForm({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      target_url: '',
      placement: 'home_sidebar',
      priority: 0,
      is_active: true,
    })
    setUploadError(null)
  }

  function startEdit(ad: any) {
    setEditing(ad)
    setForm(normalizeAd(ad))
    setUploadError(null)
  }

  async function save(e?: any) {
    if (e) e.preventDefault()

    try {
      const payload = {
        title: String(form.title || '').trim(),
        subtitle: String(form.subtitle || '').trim(),
        description: String(form.description || '').trim(),
        image_url: String(form.image_url || '').trim(),
        target_url: String(form.target_url || '').trim(),
        placement: String(form.placement || 'home_sidebar'),
        priority: Number(form.priority || 0),
        is_active: Boolean(form.is_active),
      }

      if (!payload.title) {
        alert('Nhập title quảng cáo trước.')
        return
      }

      if (editing?.id) {
        const { error } = await supabase.from('ads').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('ads').insert([payload])
        if (error) throw error
      }

      await load()
      resetForm()
    } catch (err: any) {
      console.warn('[admin-ads-save-error]', err)
      alert('Lưu quảng cáo thất bại: ' + String(err?.message ?? err))
    }
  }

  async function del(id: number) {
    if (!confirm('Xác nhận xoá quảng cáo?')) return

    try {
      const { error } = await supabase.from('ads').delete().eq('id', id)
      if (error) throw error
      await load()
    } catch (e: any) {
      console.warn('[admin-ads-delete-error]', e)
      alert('Xoá thất bại: ' + String(e?.message ?? e))
    }
  }

  async function toggleActive(ad: any) {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ is_active: !ad.is_active })
        .eq('id', ad.id)

      if (error) throw error

      await load()
    } catch (e: any) {
      console.warn('[admin-ads-toggle-error]', e)
      alert('Thao tác thất bại: ' + String(e?.message ?? e))
    }
  }

  async function handleUpload(file?: File) {
    if (!file) return

    setUploadError(null)
    setUploading(true)

    try {
      const safeName = String(file.name).replace(/[^a-zA-Z0-9.\-_]/g, '_')
      const path = `ads/${Date.now()}-${safeName}`
      const publicUrl = await uploadCoverImage(file, path)

      if (!publicUrl) throw new Error('Upload thất bại')

      setForm((prev: any) => ({ ...prev, image_url: publicUrl }))
    } catch (err: any) {
      console.warn('[admin-ads-upload-error]', err)
      setUploadError(String(err?.message ?? err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4">
      <h3 className="mb-3 text-lg font-semibold">Quản lý quảng cáo</h3>

      <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm">
        <div className="font-semibold text-emerald-200">Cách chọn quảng cáo hiện trong chương</div>

        <div className="mt-2 leading-6 text-zinc-300">
          Tạo quảng cáo active với placement{' '}
          <b className="text-amber-300">chapter_inline_1</b>,{' '}
          <b className="text-amber-300">chapter_inline_2</b>,{' '}
          <b className="text-amber-300">chapter_inline_3</b>. Nếu chọn 2 quảng cáo/chương thì
          Reader sẽ lấy slot 1 và slot 2. Nếu chọn 3 quảng cáo/chương thì lấy thêm slot 3.
        </div>

        <div className="mt-2 leading-6 text-zinc-300">
          Nếu cùng một slot có nhiều quảng cáo, quảng cáo có{' '}
          <b className="text-amber-300">priority cao hơn</b> sẽ được ưu tiên hiện trước.
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {slotPreview.map((slot) => (
          <div key={slot.placement} className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {slot.label} — {slot.placement}
            </div>

            {slot.ad ? (
              <div className="mt-2">
                <div className="font-semibold text-zinc-100">{slot.ad.title}</div>
                <div className="mt-1 text-xs text-zinc-400">
                  Priority: <b className="text-amber-300">{slot.ad.priority ?? 0}</b>
                </div>
                <div className="mt-1 truncate text-xs text-zinc-500">{slot.ad.target_url}</div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-zinc-500">Chưa có quảng cáo active cho slot này.</div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={save} className="grid gap-2">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm"
        />

        <input
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="Subtitle"
          className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm"
        />

        <div className="flex flex-col gap-2">
          <input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="Image URL"
            className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm"
          />

          <label className="text-sm text-zinc-400">Upload ảnh quảng cáo</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => void handleUpload(e.target.files?.[0])}
            className="text-sm text-zinc-200"
          />

          {uploading ? <div className="text-sm text-zinc-400">Uploading…</div> : null}
          {uploadError ? <div className="text-sm text-red-400">{uploadError}</div> : null}
        </div>

        <input
          value={form.target_url}
          onChange={(e) => setForm({ ...form, target_url: e.target.value })}
          placeholder="Target URL"
          className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm"
        />

        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm"
        />

        <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_120px_120px] sm:items-center">
          <select
            value={form.placement}
            onChange={(e) => setForm({ ...form, placement: e.target.value })}
            className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          >
            {PLACEMENT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            placeholder="Priority"
            className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm"
          />

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active
          </label>
        </div>

        <div className="text-xs leading-5 text-zinc-500">
          Gợi ý: muốn quảng cáo nào hiện nhiều/ưu tiên nhất thì đặt cùng slot và priority cao hơn, ví
          dụ 100 hoặc 999.
        </div>

        <div className="flex gap-2">
          <button type="submit" className="rounded bg-amber-300 px-3 py-2 text-sm font-semibold text-zinc-950">
            {editing ? 'Update' : 'Save'}
          </button>

          <button type="button" onClick={resetForm} className="rounded border border-zinc-800 px-3 py-2 text-sm">
            Cancel
          </button>
        </div>

        {form.image_url ? (
          <div className="mt-2">
            <div className="mb-1 text-xs text-zinc-400">Preview</div>
            <img
              src={resolveCoverUrl(form.image_url) ?? form.image_url}
              alt="preview"
              className="max-h-40 w-full rounded border border-zinc-800 object-contain"
            />
          </div>
        ) : null}
      </form>

      <div className="mt-4">
        {loading ? <div className="text-sm text-zinc-400">Loading...</div> : null}
        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <div className="mb-4 mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-5">
          <div className="rounded border border-zinc-800 bg-zinc-900/20 p-2 text-center">
            Tổng quảng cáo:
            <div className="font-semibold">{stats.totalAds}</div>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-900/20 p-2 text-center">
            Đang bật:
            <div className="font-semibold">{stats.activeAds}</div>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-900/20 p-2 text-center">
            Đang tắt:
            <div className="font-semibold">{stats.inactiveAds}</div>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-900/20 p-2 text-center">
            Home sidebar/inline:
            <div className="font-semibold">
              {stats.homeSidebarAds} / {stats.homeInlineAds}
            </div>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-900/20 p-2 text-center">
            Inline chương active:
            <div className="font-semibold">{stats.activeChapterInlineAds} / 3</div>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-400">
                <th className="w-[22%] py-2">Title</th>
                <th className="w-[20%] py-2">Placement</th>
                <th className="w-[8%] py-2">Priority</th>
                <th className="w-[8%] py-2">Active</th>
                <th className="w-[28%] py-2">Target URL</th>
                <th className="w-[14%] py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {ads.map((ad: any) => (
                <tr key={ad.id} className="border-t border-zinc-800">
                  <td className="truncate py-2 font-medium">{ad.title}</td>
                  <td className="py-2 text-zinc-400">{getPlacementLabel(ad.placement)}</td>
                  <td className="py-2">{ad.priority}</td>
                  <td className="py-2">{ad.is_active ? 'Yes' : 'No'}</td>
                  <td className="max-w-[320px] truncate break-words py-2">
                    <a
                      href={ad.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-300"
                    >
                      {String(ad.target_url || '').length > 80
                        ? String(ad.target_url).slice(0, 80) + '…'
                        : String(ad.target_url || '')}
                    </a>
                  </td>

                  <td className="flex flex-wrap gap-2 py-2">
                    <button
                      type="button"
                      className="rounded bg-sky-700 px-2 py-1 text-white hover:bg-sky-600"
                      onClick={() => startEdit(ad)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className={`rounded px-2 py-1 ${
                        ad.is_active
                          ? 'bg-orange-600 text-white hover:bg-orange-500'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                      onClick={() => toggleActive(ad)}
                    >
                      {ad.is_active ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      type="button"
                      className="rounded bg-red-700 px-2 py-1 text-white hover:bg-red-600"
                      onClick={() => del(ad.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!ads.length && !loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-zinc-500">
                    Chưa có quảng cáo nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}