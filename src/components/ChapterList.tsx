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
          <li key={c.id ?? c.slug}>
            <Link
              to={`/doc-truyen/${storySlug}/${c.slug}`}
              className="block w-full rounded-lg px-3 py-3 hover:bg-zinc-900/30 transition flex items-center justify-between"
              aria-label={`Chương ${c.number}: ${c.title}`}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-100 truncate">Chương {c.number} — {c.title}</div>
                <div className="text-xs text-zinc-400 mt-1 line-clamp-1">{c.summary ?? ''}</div>
              </div>
              <div className="ml-3 text-xs text-zinc-400">{c.publishedAt ? new Date(c.publishedAt).toLocaleDateString() : ''}</div>
            </Link>
          </li>
        ))}
      </ul>
      {sorted.length > 10 ? (
        <div className="mt-3 text-center">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="rounded px-3 py-2 text-sm bg-zinc-900/40 text-zinc-100 w-full sm:w-auto"
          >
            {expanded ? 'Thu gọn' : `Xem thêm (${sorted.length - 10} chương)`}
          </button>
        </div>
      ) : null}
    </div>
  )
}
