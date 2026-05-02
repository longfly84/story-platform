import { useEffect, useState } from 'react'
import { supabase, uploadCoverImage, resolveCoverUrl } from '@/lib/supabase'

export default function AdminAdsManager() {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<any>({ title: '', subtitle: '', description: '', image_url: '', target_url: '', placement: 'home_sidebar', priority: 0, is_active: true })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('ads').select('*').order('priority', { ascending: true })
      if (error) throw error
      setAds(data || [])
      setError(null)
    } catch (e: any) {
      console.warn('[admin-ads-load-error]', e)
      setError(String(e?.message ?? e))
      setAds([])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // compute summary stats
  const totalAds = ads.length
  const activeAds = ads.filter(a => a.is_active).length
  const inactiveAds = totalAds - activeAds
  const homeSidebarAds = ads.filter(a => a.placement === 'home_sidebar').length
  const homeInlineAds = ads.filter(a => a.placement === 'home_inline').length

  function resetForm() {
    setEditing(null)
    setForm({ title: '', subtitle: '', description: '', image_url: '', target_url: '', placement: 'home_sidebar', priority: 0, is_active: true })
  }

  async function save(e?: any) {
    if (e) e.preventDefault()
    try {
      const payload = { ...form }
      if (editing && editing.id) {
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

  async function toggleActive(a: any) {
    try {
      const { error } = await supabase.from('ads').update({ is_active: !a.is_active }).eq('id', a.id)
      if (error) throw error
      await load()
    } catch (e: any) {
      console.warn('[admin-ads-toggle-error]', e)
      alert('Thao tác thất bại: ' + String(e?.message ?? e))
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 mt-6">
      <h3 className="text-lg font-semibold mb-3">Quản lý quảng cáo</h3>

      <form onSubmit={save} className="grid gap-2">
        <input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} placeholder="Title" className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm" />
        <input value={form.subtitle} onChange={(e)=>setForm({...form, subtitle:e.target.value})} placeholder="Subtitle" className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm" />
        <div className="flex flex-col gap-2">
          <input value={form.image_url} onChange={(e)=>setForm({...form, image_url:e.target.value})} placeholder="Image URL" className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm" />
          <label className="text-sm text-zinc-400">Upload ảnh quảng cáo</label>
          <input type="file" accept="image/*" onChange={async (e)=>{
            const f = e.target.files?.[0]
            if (!f) return
            setUploadError(null)
            setUploading(true)
            try {
              const safeName = String(f.name).replace(/[^a-zA-Z0-9.\-_]/g, '_')
              const path = `ads/${Date.now()}-${safeName}`
              const publicUrl = await uploadCoverImage(f, path)
              if (!publicUrl) throw new Error('Upload thất bại')
              // set image_url to returned public url
              setForm((prev:any)=>({ ...prev, image_url: publicUrl }))
            } catch (err:any) {
              console.warn('[admin-ads-upload-error]', err)
              setUploadError(String(err?.message ?? err))
            } finally { setUploading(false) }
          }} className="text-sm text-zinc-200" />
          {uploading ? <div className="text-sm text-zinc-400">Uploading…</div> : null}
          {uploadError ? <div className="text-sm text-red-400">{uploadError}</div> : null}
        </div>
        <input value={form.target_url} onChange={(e)=>setForm({...form, target_url:e.target.value})} placeholder="Target URL" className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm" />
        <textarea value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} placeholder="Description" className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm" />
        <div className="flex gap-2 items-center">
          <select value={form.placement} onChange={(e)=>setForm({...form, placement:e.target.value})} className="rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm">
            <option value="home_sidebar">home_sidebar</option>
            <option value="home_inline">home_inline</option>
          </select>
          <input type="number" value={form.priority} onChange={(e)=>setForm({...form, priority: Number(e.target.value)})} className="w-24 rounded border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm" />
          <label className="text-sm text-zinc-300"><input type="checkbox" checked={!!form.is_active} onChange={(e)=>setForm({...form, is_active: e.target.checked})} /> Active</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded bg-amber-300 px-3 py-1 text-sm font-semibold text-zinc-950">Save</button>
          <button type="button" onClick={resetForm} className="rounded border border-zinc-800 px-3 py-1 text-sm">Cancel</button>
        </div>
        {form.image_url ? (
          <div className="mt-2">
            <div className="text-xs text-zinc-400 mb-1">Preview</div>
            <img src={resolveCoverUrl(form.image_url) ?? form.image_url} alt="preview" className="w-full max-h-40 object-contain rounded border border-zinc-800" />
          </div>
        ) : null}
      </form>

      <div className="mt-4">
        {loading ? <div>Loading...</div> : null}
        {error ? <div className="text-red-400">{error}</div> : null}
          <div className="mt-2 grid grid-cols-1 gap-3">
           <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2 text-sm">
             <div className="rounded border border-zinc-800 bg-zinc-900/20 p-2 text-center">Tổng quảng cáo: <div className="font-semibold">{totalAds}</div></div>
             <div className="rounded border border-zinc-800 bg-zinc-900/20 p-2 text-center">Đang bật: <div className="font-semibold">{activeAds}</div></div>
             <div className="rounded border border-zinc-800 bg-zinc-900/20 p-2 text-center">Đang tắt: <div className="font-semibold">{inactiveAds}</div></div>
             <div className="rounded border border-zinc-800 bg-zinc-900/20 p-2 text-center">Vị trí (sidebar/inline): <div className="font-semibold">{homeSidebarAds} / {homeInlineAds}</div></div>
           </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-400">
                <th className="w-[30%]">Title</th>
                <th className="w-[12%]">Placement</th>
                <th className="w-[8%]">Priority</th>
                <th className="w-[8%]">Active</th>
                <th className="w-[30%]">Target URL</th>
                <th className="w-[12%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((a:any)=> (
                <tr key={a.id} className="border-t border-zinc-800">
                  <td className="py-2 truncate">{a.title}</td>
                  <td className="py-2 text-zinc-400">{a.placement}</td>
                  <td className="py-2">{a.priority}</td>
                  <td className="py-2">{a.is_active ? 'Yes' : 'No'}</td>
                  <td className="py-2 truncate max-w-[320px] break-words"><a href={a.target_url} target="_blank" rel="noopener noreferrer" className="text-amber-300">{String(a.target_url || '').length > 80 ? String(a.target_url).slice(0,80) + '…' : String(a.target_url)}</a></td>
                  <td className="py-2 flex gap-2">
                    <button className="rounded px-2 py-1 bg-sky-700 text-white hover:bg-sky-600" onClick={()=>{ setEditing(a); setForm({...a}) }}>Edit</button>
                    <button className={`rounded px-2 py-1 ${a.is_active ? 'bg-orange-600 text-white hover:bg-orange-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`} onClick={()=>toggleActive(a)}>{a.is_active ? 'Disable' : 'Enable'}</button>
                    <button className="rounded px-2 py-1 bg-red-700 text-white hover:bg-red-600" onClick={()=>del(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </section>
  )
}
