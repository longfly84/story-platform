const FACEBOOK_PAGE_URL = 'https://www.facebook.com/tinystudio.danang'

export default function SidebarAdCard({ mobile }: { mobile?: boolean } = {}) {
  const wrapperClass = mobile ? 'block lg:hidden' : 'hidden lg:block'
  return (
    <div className={wrapperClass + ' rounded-xl border border-zinc-800 bg-zinc-950/40 p-4'}>
      <div className="text-xs text-zinc-400">Quảng cáo</div>
      <div className="mt-2 text-lg font-semibold text-zinc-100">Tiny Studio</div>
      <div className="mt-1 text-sm text-zinc-300">Ảnh viện cho mẹ bầu, bé và gia đình tại Đà Nẵng</div>
      <div className="mt-2 text-sm text-zinc-400">Chụp ảnh newborn, mẹ bầu, baby và gia đình.</div>
      <div className="mt-3">
        <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer" className="inline-block rounded bg-amber-300 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200">Xem fanpage</a>
      </div>
    </div>
  )
}
