import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ManageComments() {
  const [comments, setComments] = useState<any[]>([])
  const [filter, setFilter] = useState<'pending'|'approved'|'all'>('pending')
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      let q = supabase.from('comments').select('*').order('created_at', { ascending: false })
      if (filter === 'pending') q = q.eq('status', 'pending')
      if (filter === 'approved') q = q.eq('status', 'approved')
      const res = await q
      if (res.error) throw res.error
      setComments(res.data ?? [])
    } catch (e) {
      console.warn('[manage-comments-load]', e)
      setComments([])
    } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [filter])

  async function approve(id: any) {
    try {
      const res = await supabase.from('comments').update({ status: 'approved' }).eq('id', id)
      if (res.error) throw res.error
      await load()
    } catch (e) { console.warn('[approve-comment]', e) }
  }

  async function remove(id: any) {
    try {
      const res = await supabase.from('comments').delete().eq('id', id)
      if (res.error) throw res.error
      await load()
    } catch (e) { console.warn('[delete-comment]', e) }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-3">Quản lý bình luận (Admin)</h3>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setFilter('pending')} className={`px-3 py-1 rounded ${filter==='pending' ? 'bg-amber-300 text-zinc-900' : 'bg-zinc-900/20 text-zinc-200'}`}>Pending</button>
        <button onClick={() => setFilter('approved')} className={`px-3 py-1 rounded ${filter==='approved' ? 'bg-amber-300 text-zinc-900' : 'bg-zinc-900/20 text-zinc-200'}`}>Approved</button>
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter==='all' ? 'bg-amber-300 text-zinc-900' : 'bg-zinc-900/20 text-zinc-200'}`}>All</button>
      </div>

      {loading ? <div className="text-sm text-zinc-400">Loading…</div> : null}

      <ul className="space-y-3">
        {comments.map(c => (
          <li key={c.id} className="rounded border border-zinc-800 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-100">{c.author_name ?? (c.user_id ? 'Người dùng' : 'Khách')}</div>
              <div className="text-xs text-zinc-400">{c.status}</div>
            </div>
            <div className="text-sm text-zinc-300 whitespace-pre-line">{c.content}</div>
            <div className="flex items-center gap-2 mt-2">
              {c.status !== 'approved' ? <button onClick={() => approve(c.id)} className="rounded bg-emerald-600 px-3 py-1 text-sm">Approve</button> : null}
              <button onClick={() => remove(c.id)} className="rounded bg-red-600 px-3 py-1 text-sm">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
