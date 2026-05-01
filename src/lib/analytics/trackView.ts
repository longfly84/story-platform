import { supabase } from '@/lib/supabase'

type Input = {
  path: string
  storySlug?: string | null
  userId?: string | null
}

export async function trackPageView(input: Input) {
  try {
    const payload: any = {
      path: input.path,
      story_slug: input.storySlug ?? null,
      user_id: input.userId ?? null,
      referrer: (typeof document !== 'undefined' && document.referrer) ? document.referrer : null,
    }
    const { error } = await supabase.from('page_views').insert([payload])
    if (error) console.warn('[track-view-error]', error)
    return { ok: !error, error }
  } catch (e) {
    console.warn('[track-view-error]', e)
    return { ok: false, error: e }
  }
}
