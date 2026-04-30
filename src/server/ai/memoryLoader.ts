import { supabase } from '@/lib/supabase'

export async function loadMemoryForStory(slug: string) {
  if (!slug) return null
  const { data, error } = await supabase.from('stories').select('story_dna, story_memory').eq('slug', slug).single()
  if (error) return null
  return data
}

export async function loadLatestSummaries(slug: string, limit = 3) {
  if (!slug) return []
  const { data } = await supabase.from('chapters').select('summary').eq('story_slug', slug).order('number', { ascending: false }).limit(limit)
  return (data || []).map((d: any) => d.summary || '')
}
