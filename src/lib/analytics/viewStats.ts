import { supabase } from '@/lib/supabase'

export async function getStoryViewCount(storySlug: string): Promise<number | null> {
  try {
    const res = await supabase.rpc('get_story_view_counts', { story_slugs: [storySlug] }) as any
    if (res.error) {
      console.warn('[view-counts-error]', res.error)
      return 0
    }
    const rows = res.data
    if (!rows || !Array.isArray(rows) || rows.length === 0) return 0
    const r = rows.find((x: any) => x.story_slug === storySlug)
    return r ? Number(r.view_count) || 0 : 0
  } catch (e) {
    console.warn('[view-counts-error]', e)
    return 0
  }
}

export async function getStoryViewCounts(storySlugs: string[]): Promise<Record<string, number> | null> {
  try {
    if (!storySlugs || !storySlugs.length) return {}
    const res: any = await supabase.rpc('get_story_view_counts', { story_slugs: storySlugs })
    if (res.error) {
      console.warn('[view-counts-error]', res.error)
      return {}
    }
    const rows = res.data
    const counts: Record<string, number> = {}
    if (rows && Array.isArray(rows)) {
      for (const r of rows) {
        if (!r || !r.story_slug) continue
        counts[r.story_slug] = Number(r.view_count) || 0
      }
    }
    return counts
  } catch (e) {
    console.warn('[view-counts-error]', e)
    return {}
  }
}
