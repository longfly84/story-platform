import { useEffect, useState } from 'react'
import { getStoryRatingSummary, submitStoryRating } from '@/lib/analytics/ratings'
import { getCurrentUser } from '@/lib/supabase'

export default function RatingBox({ storyId }: { storyId: number }) {
  const [summary, setSummary] = useState<{ average:number, count:number }>({ average:0, count:0 })
  const [thanks, setThanks] = useState<string | null>(null)

  async function load() {
    try {
      const s = await getStoryRatingSummary(storyId)
      setSummary(s)
    } catch (e) { console.warn('[rating-load-error]', e) }
  }

  useEffect(() => { load() }, [storyId])

  async function onRate(r: number) {
    try {
      const u = await getCurrentUser()
      const userId = u?.id ?? null
      const res = await submitStoryRating(storyId, r, userId)
      if (res?.ok) {
        await load()
        setThanks('Cảm ơn bạn đã đánh giá.')
        setTimeout(() => setThanks(null), 3000)
      }
    } catch (e) { console.warn('[rating-submit-error]', e) }
  }

  return (
    <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-zinc-400">Đánh giá độc giả</div>
          <div className="mt-1 text-lg font-semibold">{summary.average.toFixed(1)} / 5 — {summary.count} lượt</div>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((n)=> (
            <button key={n} onClick={() => onRate(n)} className="px-2 py-1 rounded hover:bg-zinc-800">{n <= Math.round(summary.average) ? '★' : '☆'}</button>
          ))}
        </div>
      </div>
      {thanks ? <div className="mt-2 text-sm text-emerald-300">{thanks}</div> : null}
    </div>
  )
}
