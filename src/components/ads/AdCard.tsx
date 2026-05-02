export default function AdCard({ ad, compact }: { ad: any, compact?: boolean }) {
  if (!ad) return null
  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 ${compact ? 'p-2' : ''}`}>
      <div className="text-xs text-zinc-400">Quảng cáo</div>
      <div className="mt-2 text-lg font-semibold text-zinc-100">{ad.title}</div>
      <div className="mt-1 text-sm text-zinc-300">{ad.subtitle}</div>
      {ad.image_url ? <img src={ad.image_url} alt={ad.title} className="mt-2 w-full rounded" /> : null}
      <div className="mt-2 text-sm text-zinc-400">{ad.description}</div>
      <div className="mt-3">
        <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="inline-block rounded bg-amber-300 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200">Xem thêm</a>
      </div>
    </div>
  )
}
