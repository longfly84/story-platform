import { supabase } from '@/lib/supabase'

type Input = {
  path: string
  storySlug?: string | null
  userId?: string | null
}

export async function trackPageView(input: Input) {
  try {
    // dedupe by sessionStorage key: tn24h_view_tracked:${storySlug}:${path}
    const storySlug = input.storySlug ?? null
    const path = input.path
    const key = `tn24h_view_tracked:${storySlug}:${path}`
    try {
      const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null
      if (raw) {
        const when = Number(raw)
        const now = Date.now()
        // TTL 5 minutes
        if (!isNaN(when) && now - when < 5 * 60 * 1000) {
          if (import.meta.env.DEV) console.log('[track-view-skip-duplicate]', { path, storySlug })
          return { ok: true, skipped: true }
        }
      }
    } catch (err) {
      // ignore storage errors
    }

    if (import.meta.env.DEV) console.log('[track-view-submit]', { path, storySlug })

    // Only insert when we have a storySlug (we track page view rows only for stories)
    if (!storySlug) {
      if (import.meta.env.DEV) console.log('[track-view-skip-no-storySlug]', { path })
      return { ok: true, skipped: true }
    }

    const payload: any = {
      path: path,
      story_slug: storySlug,
      user_id: input.userId ?? null,
      referrer: (typeof document !== 'undefined' && document.referrer) ? document.referrer : null,
    }
    const { error } = await supabase.from('page_views').insert([payload])
    if (error) {
      console.warn('[track-view-error]', error)
      return { ok: false, error }
    }

    // mark dedupe key
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, String(Date.now()))
    } catch (err) {
      // ignore
    }

    return { ok: true }
  } catch (e) {
    console.warn('[track-view-error]', e)
    return { ok: false, error: e }
  }
}
