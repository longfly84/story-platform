import { useReaderSettings } from '@/hooks/useReaderSettings'
import type { ReaderTheme } from '@/hooks/useReaderSettings'

export default function ReaderToolbar() {
  const { fontSize, theme, increaseFont, decreaseFont, setTheme, resetSettings } = useReaderSettings()

  const themeBtn = (t: ReaderTheme, label: string) => (
    <button
      key={t}
      onClick={() => setTheme(t)}
      className={`px-2 py-1 rounded ${theme === t ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-200'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button onClick={decreaseFont} className="px-3 py-1 rounded bg-zinc-800 text-zinc-200">A-</button>
        <div className="px-3 py-1 text-sm">{fontSize}px</div>
        <button onClick={increaseFont} className="px-3 py-1 rounded bg-zinc-800 text-zinc-200">A+</button>
      </div>

      <div className="flex items-center gap-2">
        {themeBtn('light', 'Ngày')}
        {themeBtn('dark', 'Đêm')}
        {themeBtn('sepia', 'Vàng ấm')}
        <button onClick={resetSettings} className="ml-2 px-2 py-1 rounded bg-amber-300 text-zinc-950">Reset</button>
      </div>
    </div>
  )
}
