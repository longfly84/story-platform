import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url ?? '', key ?? '')

export async function fetchStoriesFromSupabase() {
  try {
    const { data, error } = await supabase.from('stories').select('*, chapters(*)')
    if (error) throw error
    return data
  } catch (e) {
    console.warn('Supabase fetch failed', e)
    return null
  }
}

export async function fetchStoryBySlug(slug: string) {
  try {
    // try to fetch story and related chapters if foreign table exists
    const { data, error } = await supabase.from('stories').select('*, chapters(*)').eq('slug', slug).maybeSingle()
    if (error) throw error
    return data ?? null
  } catch (e) {
    console.warn('fetchStoryBySlug failed', e)
    return null
  }
}

export async function fetchChaptersByStorySlug(storySlug: string) {
  try {
    const { data, error } = await supabase.from('chapters').select('*').eq('story_slug', storySlug).order('number', { ascending: true })
    if (error) throw error
    return data ?? null
  } catch (e) {
    console.warn('fetchChaptersByStorySlug failed', e)
    return null
  }
}

// User-related helpers: follows and reading history
export async function getUserFollows(userId: string) {
  try {
    const { data, error } = await supabase.from('user_follows').select('story_slug').eq('user_id', userId)
    if (error) throw error
    return (data ?? []).map((r: any) => r.story_slug)
  } catch (e) {
    console.warn('getUserFollows failed', e)
    return []
  }
}

export async function addUserFollow(userId: string, storySlug: string) {
  try {
    const { error } = await supabase.from('user_follows').insert([{ user_id: userId, story_slug: storySlug }])
    if (error) throw error
    return true
  } catch (e) {
    console.warn('addUserFollow failed', e)
    return false
  }
}

export async function removeUserFollow(userId: string, storySlug: string) {
  try {
    const { error } = await supabase.from('user_follows').delete().eq('user_id', userId).eq('story_slug', storySlug)
    if (error) throw error
    return true
  } catch (e) {
    console.warn('removeUserFollow failed', e)
    return false
  }
}

export async function getReadingHistoryForUser(userId: string) {
  try {
    const { data, error } = await supabase.from('reading_history').select('*').eq('user_id', userId).order('last_read', { ascending: false }).limit(20)
    if (error) throw error
    return data ?? []
  } catch (e) {
    console.warn('getReadingHistoryForUser failed', e)
    return []
  }
}

export async function upsertReadingHistoryForUser(userId: string, item: any) {
  try {
    // item: { story_slug, story_title, chapter_slug, chapter_number, chapter_title, last_read }
    const payload = { user_id: userId, story_slug: item.story_slug, story_title: item.story_title, chapter_slug: item.chapter_slug, chapter_number: item.chapter_number, chapter_title: item.chapter_title, last_read: item.last_read }
    const { error } = await supabase.from('reading_history').upsert([payload], { onConflict: 'user_id,story_slug' })
    if (error) throw error
    return true
  } catch (e) {
    console.warn('upsertReadingHistoryForUser failed', e)
    return false
  }
}

// Auth helpers
export async function signInWithEmail(email: string, password: string) {
  try {
    const res = await supabase.auth.signInWithPassword({ email, password })
    return res
  } catch (e) {
    console.warn('signInWithEmail failed', e)
    throw e
  }
}

export async function signOut() {
  try {
    await supabase.auth.signOut()
  } catch (e) {
    console.warn('signOut failed', e)
    throw e
  }
}

export async function getCurrentUser() {
  try {
    const r = await supabase.auth.getUser()
    return r.data.user ?? null
  } catch (e) {
    return null
  }
}

/**
 * Upload a cover image to Supabase Storage and return a public URL.
 * Requirements: create a public bucket named 'covers' in your Supabase project.
 * If the bucket is private, you'll need to generate signed URLs instead.
 * Do NOT hardcode keys here; storage is accessed via the existing supabase client.
 */
export async function uploadCoverImage(file: any, filename?: string) {
  if (!file) return null
  const bucket = 'covers'
  const name = filename ?? `${Date.now()}_${file.name}`
  try {
    // upload
    const { error } = await supabase.storage.from(bucket).upload(name, file, { upsert: true })
    if (error) {
      console.warn('uploadCoverImage upload error', error)
      return null
    }
    // get public url
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(name)
    return publicData?.publicUrl ?? null
  } catch (e) {
    console.warn('uploadCoverImage failed', e)
    return null
  }
}
