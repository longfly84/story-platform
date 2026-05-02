export default function TopStoriesTable({ rows }: { rows?: any[] }) {
  if (!rows || !rows.length) return <div className="text-sm text-zinc-400">No data</div>
  const shown = rows.slice(0, 10)
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 overflow-hidden">
      <div style={{ maxHeight: 320 }} className="overflow-y-auto">
        <table className="w-full text-sm table-fixed">
        <thead className="bg-zinc-900/10">
          <tr>
            <th className="text-left p-2">Rank</th>
            <th className="text-left p-2">Story</th>
            <th className="text-right p-2">Views</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r: any, idx: number) => (
            <tr key={r.story_slug ?? idx} className="border-t border-zinc-800">
              <td className="p-2 text-amber-300">#{idx + 1}</td>
              <td className="p-2 truncate max-w-[220px]">{r.title ?? r.story_slug}</td>
              <td className="p-2 text-right w-24">{(r.view_count||0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
