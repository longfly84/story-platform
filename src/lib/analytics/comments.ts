import { supabase } from '@/lib/supabase'
import { getOrCreateSessionId } from './session'

export async function submitComment(payloadObj: { storyId?: string, chapterId?: string, guestName?: string, content: string }) {
  const { storyId, guestName, content } = payloadObj
  try {
    getOrCreateSessionId()
    const payload: any = {
      story_slug: storyId ?? null,
      user_id: null,
      author_name: guestName ?? null,
      content,
      status: 'pending'
    }
    const { error } = await supabase.from('comments').insert([payload])
    if (error) return { ok: false, error }
    return { ok: true }
  } catch (e) {
    console.warn('[submitComment] exception', e)
    return { ok: false, error: e }
  }
}

export async function getApprovedComments(storyId: string) {
  try {
    const { data, error } = await supabase.from('comments').select('*').eq('story_slug', storyId).eq('status', 'approved').order('created_at', { ascending: false })
    if (error) {
      console.warn('[getApprovedComments] error', error)
      return []
    }
    return data ?? []
  } catch (e) {
    console.warn('[getApprovedComments] exception', e)
    return []
  }
}
