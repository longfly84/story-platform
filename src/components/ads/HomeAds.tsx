import { useEffect, useState } from 'react'
import { getActiveAdsByPlacement } from '@/lib/ads'
import AdCard from './AdCard'

export default function HomeAds() {
  const [ads, setAds] = useState<any[] | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getActiveAdsByPlacement('home_sidebar')
        if (!mounted) return
        setAds(res)
      } catch (e) {
        console.warn('[home-ads-error]', e)
        if (mounted) setAds([])
      }
    })()
    return () => { mounted = false }
  }, [])

  if (!ads || !ads.length) return null
  // show up to 3 ads in sidebar sorted by priority (already sorted by query)
  const list = ads.slice(0,3)
  return (
    <div className="space-y-3">
      {/* desktop: stacked cards */}
      <div className="hidden lg:block">
        {list.map((a, i) => <div key={a.id ?? i} className="mb-3"><AdCard ad={a} /></div>)}
      </div>
      {/* mobile: show first ad compact (preserve existing behavior) */}
      <div className="block lg:hidden mt-4">
        <AdCard ad={list[0]} compact />
      </div>
    </div>
  )
}
