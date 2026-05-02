import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  onSelect: (story: any | null) => void
  initialSlug?: string
  disabled?: boolean
}

export default function StorySearchSelect({ onSelect, initialSlug, disabled }: Props) {
  const [q, setQ] = useState('')
  const [all, setAll] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const { data, error } = await supabase.from('stories').select('id, title, slug, author, status, description').order('created_at', { ascending: false })
        if (error) throw error
        setAll(data || [])
        if (initialSlug) {
          const s = (data || []).find((x: any) => x.slug === initialSlug)
          if (s) { setSelected(s); onSelect(s) }
        }
      } catch (e) {
        setAll([])
      } finally { setLoading(false) }
    })()
  }, [])

  const filtered = q.trim() ? all.filter((s) => {
    const t = (s.title || '').toLowerCase()
    const sl = (s.slug || '').toLowerCase()
    const a = (s.author || '').toLowerCase()
    const ql = q.toLowerCase()
    return t.includes(ql) || sl.includes(ql) || a.includes(ql)
  }).slice(0, 10) : all.slice(0, 10)

  return (
    <div>
      <input
        className="w-full rounded bg-zinc-900/60 p-2 text-sm text-zinc-100"
        placeholder="Tìm truyện theo tên, slug, tác giả..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        disabled={Boolean(disabled)}
      />

      <div className="mt-2 max-h-40 overflow-y-auto">
        {loading ? <div className="text-xs text-zinc-400">Đang tải truyện…</div> : (
          filtered.map((s) => (
            <div key={s.id} className="p-2 hover:bg-zinc-800/60 rounded cursor-pointer" onClick={() => { setSelected(s); onSelect(s) }}>
              <div className="text-sm text-zinc-100">{s.title}</div>
              <div className="text-xs text-zinc-500">{s.author} • {s.slug}</div>
            </div>
          ))
        )}
      </div>

      {selected ? (
        <div className="mt-2 rounded border border-zinc-800 bg-zinc-900/40 p-3 text-sm text-zinc-100">
          <div className="font-semibold">Đã chọn: {selected.title}</div>
          <div className="text-xs text-zinc-400">Tác giả: {selected.author} — slug: {selected.slug}</div>
          <div className="mt-2 flex gap-2">
            <button className="rounded bg-zinc-700 px-3 py-1 text-xs" onClick={() => { setSelected(null); onSelect(null) }}>Bỏ chọn</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
