import { loadMemoryForStory, loadLatestSummaries } from './memoryLoader'
import { buildPrompt } from './promptBuilder'
import { generateWithProvider } from './providerIndex'
import buildStoryDNA from '@/config/storyEngine/buildStoryDNA'
import generateScenario from '@/config/storyEngine/generateScenario'

export async function generateChapterForStory({ storySlug, genreId, userPrompt, length, provider }: { storySlug: string, genreId?: string, userPrompt?: string, length?: string, provider?: string }) {
  // load memory + dna
  const mem = await loadMemoryForStory(storySlug)
  const latest = await loadLatestSummaries(storySlug)

  // ensure we have DNA; build if missing
  const story_dna = mem?.story_dna ?? buildStoryDNA()

  // generate scenario based on dna and/or userPrompt
  const scenario = generateScenario(story_dna)

  // build prompt with dna + scenario
  const prompt = buildPrompt({ genreId, dna: story_dna, memory: mem?.story_memory, latestSummaries: latest, userPrompt }) + `\n\nSCENARIO: ${JSON.stringify(scenario)}`

  // call provider (mock by default)
  const chosen = (provider as any) || 'mock'
  const res = await generateWithProvider(chosen as any, prompt, { length })

  // normalize result before returning
  const { normalizeAIResult } = await import('./normalizeAIResult')
  const norm = normalizeAIResult(res as any, { provider_used: res.provider_meta?.provider ?? chosen, story_dna, scenario })
  return { ...norm, prompt }
}
