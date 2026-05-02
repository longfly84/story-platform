import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { getStoryRatingSummary, submitStoryRating } from '@/lib/analytics/ratings'
import { getCurrentUser } from '@/lib/supabase'

type Props = { storyId: number | string, onUpdate?: (summary: { average:number, count:number }) => void }

export default function RatingBox({ storyId, onUpdate }: Props) {
  const [summary, setSummary] = useState<{ average:number, count:number }>({ average:0, count:0 })
  const [thanks, setThanks] = useState<string | null>(null)

  async function load() {
    try {
      const s = await getStoryRatingSummary(storyId)
      setSummary(s)
      if (typeof onUpdate === 'function') onUpdate(s)
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

  const rounded = Math.round(summary.average)

  return (
    <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/20 p-4 w-full">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm text-zinc-400 truncate">Đánh giá độc giả</div>
          {summary.count > 0 ? (
            <div className="mt-1 flex items-baseline gap-3">
              <div className="text-lg font-semibold">{summary.average.toFixed(1)} <span className="text-sm font-normal text-zinc-400">/ 5</span></div>
              <div className="text-sm text-zinc-400">{summary.count} lượt</div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-400 whitespace-normal break-words">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá truyện này.</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {[1,2,3,4,5].map((n)=> (
            <button
              key={n}
              onClick={() => onRate(n)}
              aria-label={`Đánh giá ${n} sao`}
              className={`p-2 rounded-md transition-colors ${n <= rounded ? 'text-amber-400' : 'text-zinc-400 hover:text-amber-400'} bg-transparent`}
              style={{ lineHeight: 0 }}
            >
              <Star size={24} />
            </button>
          ))}
        </div>
      </div>
      {thanks ? <div className="mt-2 text-sm text-emerald-300">{thanks}</div> : null}
    </div>
  )
}
