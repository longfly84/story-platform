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
  const ad = ads[0]
  return (
    <div>
      {/* desktop */}
      <div className="hidden lg:block">
        <AdCard ad={ad} />
      </div>
      {/* mobile */}
      <div className="block lg:hidden mt-4">
        <AdCard ad={ad} compact />
      </div>
    </div>
  )
}
