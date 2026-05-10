export type AnalyticsEventType =
  | 'page_view'
  | 'story_view'
  | 'chapter_start'
  | 'chapter_progress'
  | 'next_chapter_click'
  | 'read_time'

export type AnalyticsPayload = {
  event_type: AnalyticsEventType

  story_id?: string | null
  chapter_id?: string | null
  story_slug?: string | null
  chapter_number?: number | null

  page_path?: string | null
  referrer?: string | null

  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null

  progress_percent?: number | null
  duration_seconds?: number | null

  from_chapter_id?: string | null
  to_chapter_id?: string | null
  from_chapter_number?: number | null
  to_chapter_number?: number | null

  metadata?: Record<string, unknown>
}

const VISITOR_KEY = 'story_platform_visitor_id'
const SESSION_KEY = 'story_platform_session_id'

function createId(prefix: string) {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(16).slice(2)}`

  return `${prefix}_${random}`
}

export function getVisitorId() {
  if (typeof window === 'undefined') return ''

  const existing = localStorage.getItem(VISITOR_KEY)

  if (existing) return existing

  const next = createId('visitor')
  localStorage.setItem(VISITOR_KEY, next)

  return next
}

export function getSessionId() {
  if (typeof window === 'undefined') return ''

  const existing = sessionStorage.getItem(SESSION_KEY)

  if (existing) return existing

  const next = createId('session')
  sessionStorage.setItem(SESSION_KEY, next)

  return next
}

function getDeviceType() {
  if (typeof navigator === 'undefined') return 'unknown'

  const ua = navigator.userAgent.toLowerCase()

  if (/ipad|tablet/.test(ua)) return 'tablet'
  if (/mobile|iphone|android|ipod/.test(ua)) return 'mobile'

  return 'desktop'
}

export function getUtmParams() {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
    }
  }

  const params = new URLSearchParams(window.location.search)

  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
  }
}

export function buildFacebookStoryUrl(input: {
  url: string
  storySlug: string
  chapterNumber?: number
  campaign?: string
  medium?: 'post' | 'ads'
  contentVariant?: string
}) {
  const url = new URL(input.url)

  url.searchParams.set('utm_source', 'facebook')
  url.searchParams.set('utm_medium', input.medium || 'post')
  url.searchParams.set('utm_campaign', input.campaign || 'story_auto')

  const content = [
    input.storySlug,
    input.chapterNumber ? `chuong-${input.chapterNumber}` : '',
    input.contentVariant || '',
  ]
    .filter(Boolean)
    .join('_')

  url.searchParams.set('utm_content', content)

  return url.toString()
}

export async function trackAnalyticsEvent(payload: AnalyticsPayload) {
  if (typeof window === 'undefined') return

  const body = {
    ...payload,

    visitor_id: getVisitorId(),
    session_id: getSessionId(),

    page_path:
      payload.page_path ||
      `${window.location.pathname}${window.location.search}`,

    referrer: payload.referrer ?? document.referrer ?? null,

    ...getUtmParams(),

    device_type: getDeviceType(),
  }

  const json = JSON.stringify(body)

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: 'application/json' })
      const sent = navigator.sendBeacon('/api/analytics/track', blob)

      if (sent) return
    }

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: json,
      keepalive: true,
    })
  } catch (error) {
    console.warn('[analytics] track failed', error)
  }
}