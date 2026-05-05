import type { ReactNode } from 'react'

export function cx(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(' ')
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-slate-200">{children}</label>
}

export function SmallHint({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs leading-relaxed text-slate-400">{children}</p>
}

export function Section({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4 shadow-lg shadow-black/20 sm:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {desc ? <p className="mt-1 text-sm text-slate-400">{desc}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function ToggleChip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-full border px-2.5 py-1.5 text-left text-xs leading-tight transition sm:text-[13px]',
        active
          ? 'border-yellow-300 bg-yellow-300/10 text-yellow-200'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:bg-white/[0.06]',
      )}
    >
      {children}
    </button>
  )
}
