import { GENRE_REGISTRY } from '@/lib/storyEngine'

export function buildPrompt({ genreId, dna, memory, latestSummaries, userPrompt }: { genreId?: string, dna?: any, memory?: any, latestSummaries?: string[], userPrompt?: string }) {
  const genre = GENRE_REGISTRY.find(g => g.id === genreId)
  const parts: string[] = []
  if (genre) parts.push(`Genre: ${genre.label} - ${genre.description}`)
  if (dna) parts.push(`DNA: ${JSON.stringify(dna)}`)
  if (memory) parts.push(`Memory summary: ${memory.recent_summary ?? ''}`)
  if (latestSummaries && latestSummaries.length) parts.push(`Context from last chapters: ${latestSummaries.join(' | ')}`)
  if (userPrompt) parts.push(`User prompt: ${userPrompt}`)
  parts.push('Write a short chapter in Vietnamese, first-person, end with a cliffhanger.')
  return parts.join('\n\n')
}
