import { Link } from 'react-router-dom'
import AIFactoryPanel from '../../components/admin/ai-factory/AIFactoryPanel'

export default function AIFactoryPage() {
  return (
    <div className="min-h-screen bg-[#050609] text-white">
      <div className="border-b border-white/10 bg-[#151309]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="text-sm font-bold text-yellow-300">Admin đang đăng nhập</div>

          <div className="flex items-center gap-3 text-sm">
            <Link className="text-yellow-300 hover:text-yellow-200" to="/admin">
              Admin Dashboard
            </Link>
            <Link className="text-slate-200 hover:text-white" to="/">
              Xem trang chủ
            </Link>
          </div>
        </div>
      </div>

      <AIFactoryPanel />
    </div>
  )
}