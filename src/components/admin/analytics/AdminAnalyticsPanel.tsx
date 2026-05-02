import { useEffect, useState } from 'react'
import { getAdminAnalyticsSummary } from '@/lib/analytics/adminStats'
import AnalyticsStatCard from './AnalyticsStatCard'
import TopStoriesTable from './TopStoriesTable'
import RecentViewsTable from './RecentViewsTable'

export default function AdminAnalyticsPanel() {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadSummary() {
    setLoading(true)
    try {
      const res = await getAdminAnalyticsSummary()
      setData(res)
    } catch (e) {
      console.warn('[admin-analytics-load-error]', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadSummary() }, [])

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <button onClick={() => void loadSummary()} className="rounded px-3 py-1 bg-zinc-800 text-zinc-200">{loading ? 'Loading...' : 'Refresh'}</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <AnalyticsStatCard title="Tổng lượt xem" value={data?.total_views ?? '-'} />
        <AnalyticsStatCard title="Hôm nay" value={data?.today_views ?? '-'} />
        <AnalyticsStatCard title="7 ngày" value={data?.last_7_days_views ?? '-'} />
        <AnalyticsStatCard title="Online (5m)" value={data?.online_sessions_5m ?? '-'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
