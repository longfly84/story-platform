import type { VercelRequest, VercelResponse } from '@vercel/node'

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

type JsonRecord = Record<string, any>

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
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

function countBy<T extends JsonRecord>(rows: T[], key: keyof T) {
  const map = new Map<string, number>()

  for (const row of rows) {
    const label = String(row[key] || 'unknown')
    map.set(label, (map.get(label) || 0) + 1)
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

function uniqueCount(rows: JsonRecord[], key: string) {
  return new Set(rows.map((row) => row[key]).filter(Boolean)).size
}

function toIsoDaysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  try {
    const days = Math.max(1, Math.min(90, Number(req.query.days || 7)))
    const fromIso = toIsoDaysAgo(days)

    const events = await supabaseFetch(
      `analytics_events?created_at=gte.${encodeURIComponent(fromIso)}&select=*&order=created_at.desc&limit=5000`,
      { method: 'GET' },
    )

    const profiles = await supabaseFetch(
      `reader_profiles?select=*&order=last_seen_at.desc&limit=5000`,
      { method: 'GET' },
    )

    const segments = await supabaseFetch(
      `audience_segments?select=*&order=updated_at.desc&limit=50`,
      { method: 'GET' },
    )

    const eventRows: JsonRecord[] = Array.isArray(events) ? events : []
    const profileRows: JsonRecord[] = Array.isArray(profiles) ? profiles : []
    const segmentRows: JsonRecord[] = Array.isArray(segments) ? segments : []

    const pageViews = eventRows.filter((event) => event.event_type === 'page_view')
    const chapterStarts = eventRows.filter((event) => event.event_type === 'chapter_start')
    const finishedChapters = eventRows.filter(
      (event) =>
        event.event_type === 'chapter_progress' &&
        Number(event.progress_percent || 0) >= 90,
    )
    const nextClicks = eventRows.filter(
      (event) => event.event_type === 'next_chapter_click',
    )

    const topStoriesMap = new Map<string, JsonRecord>()

    for (const event of eventRows) {
      const key = event.story_id || event.story_slug
      if (!key) continue

      const current = topStoriesMap.get(key) || {
        story_id: event.story_id,
        story_slug: event.story_slug,
        views: 0,
        readers: new Set<string>(),
        chapter_starts: 0,
        finished_chapters: 0,
        next_clicks: 0,
      }

      if (event.event_type === 'page_view' || event.event_type === 'story_view') {
        current.views += 1
      }

      if (event.visitor_id) current.readers.add(event.visitor_id)

      if (event.event_type === 'chapter_start') current.chapter_starts += 1

      if (
        event.event_type === 'chapter_progress' &&
        Number(event.progress_percent || 0) >= 90
      ) {
        current.finished_chapters += 1
      }

      if (event.event_type === 'next_chapter_click') current.next_clicks += 1

      topStoriesMap.set(key, current)
    }

    const topStories = Array.from(topStoriesMap.values())
      .map((story) => ({
        ...story,
        readers: story.readers.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20)

    return res.status(200).json({
      ok: true,
      days,
      overview: {
        page_views: pageViews.length,
        visitors: uniqueCount(eventRows, 'visitor_id'),
        sessions: uniqueCount(eventRows, 'session_id'),
        chapter_starts: chapterStarts.length,
        finished_chapters: finishedChapters.length,
        next_chapter_clicks: nextClicks.length,
        reader_profiles: profileRows.length,
      },
      sources: countBy(eventRows, 'source'),
      devices: countBy(eventRows, 'device_type'),
      cities: countBy(profileRows, 'city'),
      countries: countBy(profileRows, 'country'),
      top_stories: topStories,
      segments: segmentRows,
    })
  } catch (error: any) {
    console.error('[analytics.summary]', error)

    return res.status(500).json({
      ok: false,
      error: error?.message || 'Analytics summary failed',
    })
  }
}