import { useEffect, useState } from 'react'

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Lên đầu"
      className="fixed bottom-6 right-4 z-50 rounded-full bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 shadow-lg hover:bg-zinc-900"
    >
      ↑ Lên đầu
    </button>
  )
}
