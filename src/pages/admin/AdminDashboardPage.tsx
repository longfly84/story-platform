import { Link } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'

export default function AdminDashboardPage() {
  const cards = [
    { title: 'Quản lý nội dung', desc: 'Stories, chapters, categories', to: '/admin/content' },
    { title: 'Analytics', desc: 'Thống kê lượt xem & top truyện', to: '/admin/analytics' },
    { title: 'Quản lý quảng cáo', desc: 'Tạo / sửa quảng cáo hiển thị', to: '/admin/ads' },
    { title: 'AI Writer', desc: 'Gợi ý & tạo nội dung AI', to: '/admin/ai-writer' },
  ]

  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold text-zinc-100 mb-4">Admin Dashboard</h1>

        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 hover:shadow-lg">
              <div className="text-lg font-semibold text-zinc-100">{c.title}</div>
              <div className="mt-1 text-sm text-zinc-400">{c.desc}</div>
            </Link>
          ))}
        </div>
      </main>
    </MainLayout>
  )
}
