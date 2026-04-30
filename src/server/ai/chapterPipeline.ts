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
  let story_dna = mem?.story_dna ?? buildStoryDNA()

  // if dna missing character profile, generate minimal character profile from CHARACTER_RULES
  try {
    const { CHARACTER_RULES } = await import('@/config/storyEngine/characterRules')
    if (!story_dna.character_profile) {
      const gid = story_dna.genreId || genreId || 'family_revenge'
      const profile = CHARACTER_RULES[gid] || null
      if (profile) {
        story_dna = { ...story_dna, character_profile: profile }
      }
    }
    // if dna missing villain_profile, generate minimal villain profile from VILLAIN_RULES
    const { VILLAIN_RULES } = await import('@/config/storyEngine/villainRules')
    if (!story_dna.villain_profile) {
      // pick a reasonable villain based on genre mapping
      const gid = story_dna.genreId || genreId || 'family_revenge'
      let pick = 'greedy_relative'
      if (gid === 'workplace_revenge') pick = 'arrogant_boss'
      else if (gid === 'school_betrayal') pick = 'golden_child_sibling'
      else if (gid === 'hidden_authority') pick = 'status_thief'
      else if (gid === 'toxic_family') pick = 'toxic_mother'
      const v = VILLAIN_RULES[pick] || Object.values(VILLAIN_RULES)[0]
      if (v) story_dna = { ...story_dna, villain_profile: v }
    }
  } catch (e) {
    // ignore if config missing
  }

  // generate scenario based on dna and/or userPrompt
  const scenario = generateScenario(story_dna)
  // determine payoff stage from chapter number or story memory
  try {
    const { getStageForChapter } = await import('@/config/storyEngine/payoffTiming')
    const chapterNumber = (latest && latest.length) ? (latest.length + 1) : 1
    const payoff_stage_from_ch = getStageForChapter(chapterNumber)
    story_dna = { ...story_dna, payoff_stage: story_dna.payoff_stage || payoff_stage_from_ch }
  } catch (e) {
    // ignore
  }

  // build minimal continuity context from memory + latest summaries
  const continuity = {
    unresolved_conflict: (mem?.story_memory?.active_conflicts && mem.story_memory.active_conflicts.length) ? mem.story_memory.active_conflicts.join(' | ') : '',
    latest_cliffhanger: (latest && latest.length) ? latest[0] : (mem?.story_memory?.recent_cliff || ''),
    latest_emotional_state: (mem?.story_memory?.emotion_tags || []).slice(-3),
    villain_current_advantage: (story_dna as any).villain_profile?.archetype || mem?.story_memory?.villain_advantage || '',
    protagonist_current_goal: (story_dna as any).protagonist_goal || mem?.story_memory?.current_goal || ''
  }

  // attach to dna so promptBuilder can inject continuity into prompt
  story_dna = { ...story_dna, continuity }

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
