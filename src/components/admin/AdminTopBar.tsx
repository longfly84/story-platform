import { Link } from 'react-router-dom'

type Props = {
  checkingSession?: boolean
  onLogout: () => void | Promise<void>
}

export default function AdminTopBar({ checkingSession, onLogout }: Props) {
  return (
    <>
      <header className="mb-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">Admin CMS</h1>
            <div className="text-xs text-zinc-400">Đang đăng nhập</div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Link to="/admin" className="rounded bg-zinc-900/60 px-3 py-1 text-xs text-amber-300">Admin Dashboard</Link>
            <Link to="/" className="rounded bg-zinc-900/60 px-3 py-1 text-xs text-zinc-200">Xem trang chủ</Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin" className="text-sm text-amber-300 hover:underline sm:hidden">Admin</Link>
          <Link to="/" className="text-sm text-zinc-400 hover:underline">Xem trang chủ</Link>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="rounded bg-zinc-800 px-3 py-1 text-sm text-zinc-100"
          >
            Logout
          </button>
        </div>
      </header>

      {checkingSession ? (
        <div className="mb-4 text-sm text-zinc-400">Đang kiểm tra phiên đăng nhập…</div>
      ) : null}
    </>
  )
}
