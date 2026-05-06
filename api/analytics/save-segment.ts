import type { VercelRequest, VercelResponse } from '@vercel/node'

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

type JsonRecord = Record<string, any>

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function safeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function safeNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
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

  return JSON.parse(text)
}

function profileMatches(profile: JsonRecord, filters: JsonRecord) {
  const city = safeString(filters.city)
  const country = safeString(filters.country)
  const source = safeString(filters.source)
  const utmSource = safeString(filters.utm_source)
  const deviceType = safeString(filters.device_type)
  const favoriteGenre = safeString(filters.favorite_genre)

  const minTotalSessions = safeNumber(filters.min_total_sessions)
  const minTotalPageViews = safeNumber(filters.min_total_page_views)
  const minChapterStarts = safeNumber(filters.min_total_chapter_starts)
  const minFinishedChapters = safeNumber(filters.min_total_finished_chapters)

  if (city && safeString(profile.city).toLowerCase() !== city.toLowerCase()) {
    return false
  }

  if (country && safeString(profile.country).toLowerCase() !== country.toLowerCase()) {
    return false
  }

  if (source && safeString(profile.last_source).toLowerCase() !== source.toLowerCase()) {
    return false
  }

  if (
    utmSource &&
    safeString(profile.last_utm_source).toLowerCase() !== utmSource.toLowerCase()
  ) {
    return false
  }

  if (
    deviceType &&
    safeString(profile.device_type).toLowerCase() !== deviceType.toLowerCase()
  ) {
    return false
  }

  if (
    favoriteGenre &&
    safeString(profile.favorite_genre).toLowerCase() !== favoriteGenre.toLowerCase()
  ) {
    return false
  }

  if (
    minTotalSessions !== null &&
    Number(profile.total_sessions || 0) < minTotalSessions
  ) {
    return false
  }

  if (
    minTotalPageViews !== null &&
    Number(profile.total_page_views || 0) < minTotalPageViews
  ) {
    return false
  }

  if (
    minChapterStarts !== null &&
    Number(profile.total_chapter_starts || 0) < minChapterStarts
  ) {
    return false
  }

  if (
    minFinishedChapters !== null &&
    Number(profile.total_finished_chapters || 0) < minFinishedChapters
  ) {
    return false
  }

  return true
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

    const name = safeString(body.name)
    const description = safeString(body.description)
    const filters = body.filters && typeof body.filters === 'object' ? body.filters : {}

    if (!name) {
      return res.status(400).json({
        ok: false,
        error: 'Missing segment name',
      })
    }

    const profiles = await supabaseFetch(
      `reader_profiles?select=*&order=last_seen_at.desc&limit=10000`,
      { method: 'GET' },
    )

    const profileRows: JsonRecord[] = Array.isArray(profiles) ? profiles : []

    const matchedProfiles = profileRows.filter((profile) =>
      profileMatches(profile, filters),
    )

    const segmentPayload = {
      name,
      description: description || null,

      city: safeString(filters.city) || null,
      region: safeString(filters.region) || null,
      country: safeString(filters.country) || null,

      source: safeString(filters.source) || null,
      utm_source: safeString(filters.utm_source) || null,
      utm_medium: safeString(filters.utm_medium) || null,
      utm_campaign: safeString(filters.utm_campaign) || null,

      device_type: safeString(filters.device_type) || null,
      favorite_genre: safeString(filters.favorite_genre) || null,

      min_total_sessions: safeNumber(filters.min_total_sessions),
      min_total_page_views: safeNumber(filters.min_total_page_views),
      min_total_chapter_starts: safeNumber(filters.min_total_chapter_starts),
      min_total_finished_chapters: safeNumber(filters.min_total_finished_chapters),

      filter_config: filters,
      estimated_readers: matchedProfiles.length,
      is_active: true,
    }

    const createdSegments = await supabaseFetch('audience_segments?select=*', {
      method: 'POST',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify(segmentPayload),
    })

    const segment = Array.isArray(createdSegments) ? createdSegments[0] : null

    if (!segment?.id) {
      throw new Error('Failed to create segment')
    }

    const members = matchedProfiles.map((profile) => ({
      segment_id: segment.id,
      visitor_id: profile.visitor_id,

      city: profile.city,
      region: profile.region,
      country: profile.country,

      first_seen_at: profile.first_seen_at,
      last_seen_at: profile.last_seen_at,

      total_sessions: profile.total_sessions || 0,
      total_page_views: profile.total_page_views || 0,
      total_chapter_starts: profile.total_chapter_starts || 0,
      total_finished_chapters: profile.total_finished_chapters || 0,

      source: profile.last_source,
      utm_source: profile.last_utm_source,
      device_type: profile.device_type,
      favorite_genre: profile.favorite_genre,
    }))

    if (members.length > 0) {
      await supabaseFetch('audience_segment_members', {
        method: 'POST',
        headers: {
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(members),
      })
    }

    return res.status(200).json({
      ok: true,
      segment,
      estimated_readers: matchedProfiles.length,
    })
  } catch (error: any) {
    console.error('[analytics.save-segment]', error)

    return res.status(500).json({
      ok: false,
      error: error?.message || 'Save segment failed',
    })
  }
}