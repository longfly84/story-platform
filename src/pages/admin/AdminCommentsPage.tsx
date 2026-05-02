import MainLayout from '@/layouts/MainLayout'
import { Link } from 'react-router-dom'
import ManageComments from '@/components/admin/ManageComments'

export default function AdminCommentsPage() {
  return (
    <MainLayout>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link to="/admin/content" className="text-sm text-amber-300">
            ← Quay lại Content
          </Link>

          <Link
            to="/admin"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:border-amber-300"
          >
            Admin Dashboard
          </Link>
        </div>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
          <h1 className="mb-4 text-xl font-semibold text-zinc-100">Quản lý bình luận</h1>
          <ManageComments />
        </section>
      </main>
    </MainLayout>
  )
}