import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { trackAnalyticsEvent } from '@/lib/analytics/index'

export default function AnalyticsRouteTracker() {
  const location = useLocation()

  useEffect(() => {
    trackAnalyticsEvent({
      event_type: 'page_view',
      page_path: `${location.pathname}${location.search}`,
    })
  }, [location.pathname, location.search])

  return null
}