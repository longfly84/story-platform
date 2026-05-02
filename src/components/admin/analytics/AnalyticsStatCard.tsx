export default function AnalyticsStatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-2">
      <div className="text-xs text-zinc-400">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}
