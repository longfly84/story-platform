import MainLayout from '@/layouts/MainLayout'
import { Link } from 'react-router-dom'
import AdminAnalyticsPanel from '@/components/admin/analytics/AdminAnalyticsPanel'

export default function AdminAnalyticsPage() {
  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4"><Link to="/admin" className="text-sm text-amber-300">← Quay lại Admin Dashboard</Link></div>
        <AdminAnalyticsPanel />
      </main>
    </MainLayout>
  )
}
