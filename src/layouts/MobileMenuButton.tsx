import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu as MenuIcon, X as XIcon } from 'lucide-react'

export default function MobileMenuButton() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setOpen(o => !o)} className="rounded px-2 py-1 border border-zinc-800 bg-zinc-950/30 text-zinc-100 flex items-center gap-2">
        {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
        <span className="text-sm">Menu</span>
      </button>

      {open ? (
        <div className="absolute left-3 top-14 z-50 w-[86%] max-w-sm rounded border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
          <nav className="flex flex-col gap-2">
            <Link onClick={() => setOpen(false)} to="/" className="px-3 py-2 rounded hover:bg-zinc-900">Trang chủ</Link>
            <a onClick={() => setOpen(false)} href="/#categories" className="px-3 py-2 rounded hover:bg-zinc-900">Thể loại</a>
            <a onClick={() => setOpen(false)} href="/#chapter-count" className="px-3 py-2 rounded hover:bg-zinc-900">Theo số chương</a>
            <Link onClick={() => setOpen(false)} to="/admin" className="px-3 py-2 rounded hover:bg-zinc-900">Admin</Link>
          </nav>
        </div>
      ) : null}
    </div>
  )
}
