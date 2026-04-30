import { loadMemoryForStory, loadLatestSummaries } from './memoryLoader'
import { buildPrompt } from './promptBuilder'
import { generateWithProvider } from './providerIndex'

export async function generateChapterForStory({ storySlug, genreId, userPrompt, length }: { storySlug: string, genreId?: string, userPrompt?: string, length?: string }) {
  // load memory + dna
  const mem = await loadMemoryForStory(storySlug)
  const latest = await loadLatestSummaries(storySlug)
  const prompt = buildPrompt({ genreId, dna: mem?.story_dna, memory: mem?.story_memory, latestSummaries: latest, userPrompt })

  // call provider (mock by default)
  const provider = 'mock'
  const res = await generateWithProvider(provider as any, prompt, { length })
  return { ...res, prompt }
}
