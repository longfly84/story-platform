import { supabase } from '@/lib/supabase'

export async function getStoryStats(storyId: string) {
  try {
    const { data, error } = await supabase.from('story_stats').select('*').eq('story_slug', storyId).maybeSingle()
    if (error) {
      console.warn('[getStoryStats] error', error)
      return null
    }
    return data ?? null
  } catch (e) {
    console.warn('[getStoryStats] exception', e)
    return null
  }
}
