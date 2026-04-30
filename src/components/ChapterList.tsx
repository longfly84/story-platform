import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ChapterList({ chapters, storySlug }: { chapters: any[]; storySlug: string }) {
  const [expanded, setExpanded] = useState(false)
  const sorted = [...(chapters ?? [])].sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
  const display = expanded ? sorted : sorted.slice(0, 10)

  return (
    <div>
      <ul className="space-y-2">
        {display.map((c) => (
          <li key={c.id ?? c.slug} className="flex items-center justify-between rounded p-2 hover:bg-zinc-900/30">
            <Link to={`/doc-truyen/${storySlug}/${c.slug}`} className="text-sm text-zinc-100">{`Chương ${c.number}: ${c.title}`}</Link>
            <div className="text-xs text-zinc-400">{c.publishedAt ? new Date(c.publishedAt).toLocaleDateString() : ''}</div>
          </li>
        ))}
      </ul>
      {sorted.length > 10 ? (
        <div className="mt-3 text-center">
          <button onClick={() => setExpanded((e) => !e)} className="rounded px-3 py-1 text-sm bg-zinc-900/40 text-zinc-100">
            {expanded ? 'Thu gọn' : `Xem thêm (${sorted.length - 10} chương)`}
          </button>
        </div>
      ) : null}
    </div>
  )
}
