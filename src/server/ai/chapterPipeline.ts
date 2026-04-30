import { loadMemoryForStory, loadLatestSummaries } from './memoryLoader'
import { buildPrompt } from './promptBuilder'
import { generateMock } from './providers/mockProvider'

export async function generateChapterForStory({ storySlug, genreId, userPrompt, length }: { storySlug: string, genreId?: string, userPrompt?: string, length?: string }) {
  // load memory + dna
  const mem = await loadMemoryForStory(storySlug)
  const latest = await loadLatestSummaries(storySlug)
  const prompt = buildPrompt({ genreId, dna: mem?.story_dna, memory: mem?.story_memory, latestSummaries: latest, userPrompt })

  // call provider (mock for now)
  const res = await generateMock(prompt, { length })
  return { ...res, prompt }
}
