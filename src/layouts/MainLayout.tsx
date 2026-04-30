import { Link } from "react-router-dom"

import { Input } from "@/components/ui/input"

export default function MainLayout({
  children,
  headerRight,
  headerBottom,
}: {
  children: React.ReactNode
  headerRight?: React.ReactNode
  headerBottom?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-3 sm:px-4 sm:h-16">
          <Link to="/" className="text-lg font-semibold tracking-wide sm:text-xl truncate whitespace-nowrap">
            Đọc Truyện
          </Link>

          <nav className="hidden items-center gap-4 text-sm text-zinc-300 md:flex">
            <button className="hover:text-zinc-100">Thể loại</button>
            <button className="hover:text-zinc-100">Theo số chương</button>
          </nav>

          <div className="ml-auto flex w-full max-w-[520px] items-center gap-2">
            {headerRight ?? (
              <Input
                placeholder="Tìm kiếm (tên truyện hoặc tác giả)…"
                className="hidden border-zinc-800/80 bg-zinc-950/30 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-amber-300/20 sm:block"
              />
            )}
          </div>

          <div className="ml-2 flex items-center md:hidden">
            <button className="rounded px-2 py-1 border border-zinc-800 bg-zinc-950/30 text-zinc-100">Menu</button>
          </div>
        </div>

        {headerBottom ? (
          <div className="mx-auto max-w-7xl px-4 pb-4 sm:hidden">
            <div className="mt-2">{headerBottom}</div>
          </div>
        ) : null}
      </header>

      {children}
    </div>
  )
}
