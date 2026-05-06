import type { VercelRequest, VercelResponse } from '@vercel/node'

type JsonRecord = Record<string, any>

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function safeString(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function safeNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function decodeHeader(value: unknown) {
  const raw = safeString(Array.isArray(value) ? value[0] : value)
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function getHeader(req: VercelRequest, name: string) {
  return req.headers[name.toLowerCase()]
}

function detectDevice(userAgent: string) {
  const ua = userAgent.toLowerCase()

  if (/ipad|tablet/.test(ua)) return 'tablet'
  if (/mobile|iphone|android|ipod/.test(ua)) return 'mobile'

  return 'desktop'
}

function detectSource(input: {
  utm_source?: string
  referrer?: string
}) {
  const utmSource = safeString(input.utm_source).toLowerCase()
  const referrer = safeString(input.referrer).toLowerCase()

  if (utmSource) return utmSource

  if (
    referrer.includes('facebook.com') ||
    referrer.includes('l.facebook.com') ||
    referrer.includes('m.facebook.com')
  ) {
    return 'facebook'
  }

  if (referrer.includes('google.')) return 'google'
  if (referrer.includes('bing.')) return 'bing'
  if (referrer.includes('zalo.')) return 'zalo'
  if (referrer.includes('tiktok.')) return 'tiktok'

  if (!referrer) return 'direct'

  return 'other'
}

function getLocationFromHeaders(req: VercelRequest) {
  const city = decodeHeader(getHeader(req, 'x-vercel-ip-city'))
  const region = decodeHeader(getHeader(req, 'x-vercel-ip-country-region'))
  const country = decodeHeader(getHeader(req, 'x-vercel-ip-country'))
  const timezone = decodeHeader(getHeader(req, 'x-vercel-ip-timezone'))

  return {
    city: city || null,
    region: region || null,
    country: country || null,
    timezone: timezone || null,
    location_source: country || region || city ? 'ip' : 'unknown',
  }
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`

  const res = await fetch(url, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  const text = await res.text()

  if (!res.ok) {
    throw new Error(`Supabase REST error ${res.status}: ${text}`)
  }

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function getReaderProfile(visitorId: string) {
  const rows = await supabaseFetch(
    `reader_profiles?visitor_id=eq.${encodeURIComponent(visitorId)}&select=*`,
    {
      method: 'GET',
    },
  )

  return Array.isArray(rows) ? rows[0] || null : null
}

async function createReaderProfile(payload: JsonRecord) {
  await supabaseFetch('reader_profiles', {
    method: 'POST',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  })
}

async function updateReaderProfile(visitorId: string, payload: JsonRecord) {
  await supabaseFetch(`reader_profiles?visitor_id=eq.${encodeURIComponent(visitorId)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  })
}

async function insertAnalyticsEvent(payload: JsonRecord) {
  await supabaseFetch('analytics_events', {
    method: 'POST',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {}

    const visitorId = safeString(body.visitor_id)
    const sessionId = safeString(body.session_id)
    const eventType = safeString(body.event_type)

    if (!visitorId || !sessionId || !eventType) {
      return res.status(400).json({
        ok: false,
        error: 'Missing visitor_id, session_id or event_type',
      })
    }

    const userAgent = safeString(req.headers['user-agent'])
    const location = getLocationFromHeaders(req)
    const deviceType = safeString(body.device_type) || detectDevice(userAgent)

    const referrer = safeString(body.referrer)
    const utm_source = safeString(body.utm_source)
    const source = detectSource({
      utm_source,
      referrer,
    })

    const eventPayload: JsonRecord = {
      event_type: eventType,

      visitor_id: visitorId,
      session_id: sessionId,

      story_id: safeString(body.story_id) || null,
      chapter_id: safeString(body.chapter_id) || null,
      story_slug: safeString(body.story_slug) || null,
      chapter_number: safeNumber(body.chapter_number),

      page_path: safeString(body.page_path) || null,
      referrer: referrer || null,

      utm_source: utm_source || null,
      utm_medium: safeString(body.utm_medium) || null,
      utm_campaign: safeString(body.utm_campaign) || null,
      utm_content: safeString(body.utm_content) || null,

      source,
      device_type: deviceType,

      country: location.country,
      region: location.region,
      city: location.city,
      timezone: location.timezone,
      location_source: location.location_source,

      progress_percent: safeNumber(body.progress_percent),
      duration_seconds: safeNumber(body.duration_seconds),

      from_chapter_id: safeString(body.from_chapter_id) || null,
      to_chapter_id: safeString(body.to_chapter_id) || null,
      from_chapter_number: safeNumber(body.from_chapter_number),
      to_chapter_number: safeNumber(body.to_chapter_number),

      metadata:
        body.metadata && typeof body.metadata === 'object'
          ? body.metadata
          : {},
    }

    await insertAnalyticsEvent(eventPayload)

    const existingProfile = await getReaderProfile(visitorId)
    const now = new Date().toISOString()

    const isPageView = eventType === 'page_view'
    const isChapterStart = eventType === 'chapter_start'
    const isFinishedChapter =
      eventType === 'chapter_progress' &&
      Number(eventPayload.progress_percent || 0) >= 90

    if (!existingProfile) {
      await createReaderProfile({
        visitor_id: visitorId,

        first_seen_at: now,
        last_seen_at: now,

        country: location.country,
        region: location.region,
        city: location.city,
        timezone: location.timezone,
        location_source: location.location_source,

        first_source: source,
        last_source: source,

        first_utm_source: eventPayload.utm_source,
        first_utm_medium: eventPayload.utm_medium,
        first_utm_campaign: eventPayload.utm_campaign,
        first_utm_content: eventPayload.utm_content,

        last_utm_source: eventPayload.utm_source,
        last_utm_medium: eventPayload.utm_medium,
        last_utm_campaign: eventPayload.utm_campaign,
        last_utm_content: eventPayload.utm_content,

        total_sessions: 1,
        total_page_views: isPageView ? 1 : 0,
        total_chapter_starts: isChapterStart ? 1 : 0,
        total_finished_chapters: isFinishedChapter ? 1 : 0,

        device_type: deviceType,

        metadata: {},
      })
    } else {
      await updateReaderProfile(visitorId, {
        last_seen_at: now,
        updated_at: now,

        country: existingProfile.country || location.country,
        region: existingProfile.region || location.region,
        city: existingProfile.city || location.city,
        timezone: existingProfile.timezone || location.timezone,
        location_source: existingProfile.location_source || location.location_source,

        last_source: source,

        last_utm_source: eventPayload.utm_source,
        last_utm_medium: eventPayload.utm_medium,
        last_utm_campaign: eventPayload.utm_campaign,
        last_utm_content: eventPayload.utm_content,

        total_page_views:
          Number(existingProfile.total_page_views || 0) + (isPageView ? 1 : 0),

        total_chapter_starts:
          Number(existingProfile.total_chapter_starts || 0) + (isChapterStart ? 1 : 0),

        total_finished_chapters:
          Number(existingProfile.total_finished_chapters || 0) +
          (isFinishedChapter ? 1 : 0),

        device_type: existingProfile.device_type || deviceType,
      })
    }

    return res.status(200).json({ ok: true })
  } catch (error: any) {
    console.error('[analytics.track]', error)

    return res.status(500).json({
      ok: false,
      error: error?.message || 'Analytics track failed',
    })
  }
}