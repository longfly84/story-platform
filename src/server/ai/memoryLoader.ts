import { supabase } from '../supabaseServer'

function ensureSupabase() {
  if (!supabase) throw new Error('Server Supabase not configured (missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)')
}

export async function loadMemoryForStory(slug: string) {
  if (!slug) return null
  ensureSupabase()
  const { data, error } = await supabase!.from('stories').select('story_dna, story_memory').eq('slug', slug).single()
  if (error) return null
  return data
}

export async function loadLatestSummaries(slug: string, limit = 3) {
  if (!slug) return []
  ensureSupabase()
  const { data } = await supabase!.from('chapters').select('summary').eq('story_slug', slug).order('number', { ascending: false }).limit(limit)
  return (data || []).map((d: any) => d.summary || '')
}
