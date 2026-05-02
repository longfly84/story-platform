export default function RecentViewsTable({ rows }: { rows?: any[] }) {
  if (!rows || !rows.length) return <div className="text-sm text-zinc-400">No recent views</div>
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 overflow-hidden">
      <div style={{ maxHeight: 260 }} className="overflow-y-auto">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-zinc-900/10">
            <tr>
              <th className="text-left p-2 w-28">When</th>
              <th className="text-left p-2">Story / Path</th>
              <th className="text-left p-2 w-40">Referrer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-zinc-800">
                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2 truncate max-w-[220px]">{r.story_slug ?? r.path}</td>
                <td className="p-2 truncate">{(r.referrer || '').slice(0, 80)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
