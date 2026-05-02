import MainLayout from '@/layouts/MainLayout'
import { Link } from 'react-router-dom'
import AdminAdsManager from '@/components/admin/ads/AdminAdsManager'

export default function AdminAdsPage() {
  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4"><Link to="/admin" className="text-sm text-amber-300">← Quay lại Admin Dashboard</Link></div>
        <AdminAdsManager />
      </main>
    </MainLayout>
  )
}
