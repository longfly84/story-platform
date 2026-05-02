import { supabase } from '@/lib/supabase'

export async function getStoryRatingSummary(storyId: number) {
  try {
    const { data, error } = await supabase.from('story_ratings').select('rating').eq('story_id', storyId)
    if (error) {
      console.warn('[ratings-getSummary-error]', error)
      return { average: 0, count: 0 }
    }
    if (!data || !Array.isArray(data) || data.length === 0) return { average: 0, count: 0 }
    const count = data.length
    const sum = data.reduce((s: number, r: any) => s + (Number(r.rating) || 0), 0)
    const average = sum / count
    return { average, count }
  } catch (e) {
    console.warn('[ratings-getSummary-error]', e)
    return { average: 0, count: 0 }
  }
}

export async function submitStoryRating(storyId: number, rating: number, userId?: string | null) {
  try {
    const payload: any = { story_id: storyId, rating: Math.max(1, Math.min(5, Math.round(rating))), user_id: userId ?? null }
    const { error } = await supabase.from('story_ratings').insert([payload])
    if (error) {
      console.warn('[ratings-submit-error]', error)
      return { ok: false, error }
    }
    return { ok: true }
  } catch (e) {
    console.warn('[ratings-submit-error]', e)
    return { ok: false, error: e }
  }
}
