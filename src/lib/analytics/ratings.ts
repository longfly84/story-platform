import { supabase } from '@/lib/supabase'

export type StoryRatingSummary = { average: number, count: number }

function summarizeRatings(data: any[] | null): StoryRatingSummary {
  if (!data || !Array.isArray(data) || data.length === 0) return { average: 0, count: 0 }
  const count = data.length
  const sum = data.reduce((s: number, r: any) => s + (Number(r.rating) || 0), 0)
  return { average: sum / count, count }
}

export async function getStoryRatingSummary(storyId?: number | string | null, storySlug?: string | null) {
  try {
    if (storyId !== undefined && storyId !== null) {
      const { data, error } = await supabase.from('story_ratings').select('rating').eq('story_id', storyId)
      if (!error) return summarizeRatings(data)
      if (!storySlug) console.warn('[ratings-getSummary-story-id-error]', error)
    }
    if (storySlug) {
      const { data, error } = await supabase.from('story_ratings').select('rating').eq('story_slug', storySlug)
      if (!error) return summarizeRatings(data)
      console.warn('[ratings-getSummary-story-slug-error]', error)
    }
    return { average: 0, count: 0 }
  } catch (e) {
    console.warn('[ratings-getSummary-error]', e)
    return { average: 0, count: 0 }
  }
}

export async function submitStoryRating(storyId: number | string | null | undefined, rating: number, userId?: string | null, storySlug?: string | null) {
  try {
    const safeRating = Math.max(1, Math.min(5, Math.round(rating)))
    if (storyId !== undefined && storyId !== null) {
      const payload: any = { story_id: storyId, rating: safeRating, user_id: userId ?? null }
      const { error } = await supabase.from('story_ratings').insert([payload])
      if (!error) return { ok: true }
      if (!storySlug) {
        console.warn('[ratings-submit-story-id-error]', error)
        return { ok: false, error }
      }
    }
    if (!storySlug) return { ok: false, error: new Error('Missing story id/slug for rating') }
    const payload: any = { story_slug: storySlug, rating: safeRating, user_id: userId ?? null }
    const { error } = await supabase.from('story_ratings').insert([payload])
    if (error) return { ok: false, error }
    return { ok: true }
  } catch (e) {
    console.warn('[ratings-submit-error]', e)
    return { ok: false, error: e }
  }
}
