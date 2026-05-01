import { useEffect, useState } from 'react'
import { getAdminAnalyticsSummary } from '@/lib/analytics/adminStats'
import AnalyticsStatCard from './AnalyticsStatCard'
import TopStoriesTable from './TopStoriesTable'
import RecentViewsTable from './RecentViewsTable'

export default function AdminAnalyticsPanel() {
  const [data, setData] = useState<any | null>(null)

  async function load() {
    try {
      const res = await getAdminAnalyticsSummary()
      setData(res)
    } catch (e) {
      console.warn('[admin-analytics-load-error]', e)
      setData(null)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <div>
          <button onClick={load} className="rounded px-3 py-1 bg-zinc-800 text-zinc-200">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <AnalyticsStatCard title="Tổng lượt xem" value={data?.total_views ?? '-'} />
        <AnalyticsStatCard title="Lượt xem hôm nay" value={data?.today_views ?? '-'} />
        <AnalyticsStatCard title="7 ngày" value={data?.last_7_days_views ?? '-'} />
        <AnalyticsStatCard title="Online (5m)" value={data?.online_sessions_5m ?? '-'} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <h3 className="text-lg font-medium mb-2">Top truyện</h3>
          <TopStoriesTable rows={data?.top_stories} />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Recent views</h3>
          <RecentViewsTable rows={data?.recent_views} />
        </div>
      </div>
    </section>
  )
}
