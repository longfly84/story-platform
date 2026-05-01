import { supabase } from '@/lib/supabase'
import { getOrCreateSessionId } from './session'

export async function submitStoryRating(storyId: string, rating: number) {
  try {
    const r = Math.max(1, Math.min(5, Math.round(rating)))
    getOrCreateSessionId()
    const { error } = await supabase.from('story_ratings').insert([{ story_slug: storyId, rating: r, user_id: null }])
    if (error) return { ok: false, error }
    return { ok: true }
  } catch (e) {
    console.warn('[submitStoryRating] exception', e)
    return { ok: false, error: e }
  }
}
