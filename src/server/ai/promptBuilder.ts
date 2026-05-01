import { GENRE_REGISTRY } from '@/lib/storyEngine'
import { HOOK_POOLS, CLIFFHANGER_POOLS, DRAMA_POOLS } from '@/config/storyEngine/retentionPools'
import { GENRE_PERSONALITIES } from '@/config/storyEngine/genrePersonalities'
import { CHARACTER_RULES } from '@/config/storyEngine/characterRules'
import { FEW_SHOT_STYLE_EXAMPLES } from '@/config/storyEngine/styleExamples'

export function buildPrompt({ genreId, dna, memory, latestSummaries, userPrompt }: { genreId?: string, dna?: any, memory?: any, latestSummaries?: string[], userPrompt?: string }) {
  const genre = GENRE_REGISTRY.find(g => g.id === genreId)
  const parts: string[] = []
  if (genre) parts.push(`Genre: ${genre.label} - ${genre.description}`)
  if (dna) parts.push(`DNA: ${JSON.stringify(dna)}`)
  if (memory) parts.push(`Memory summary: ${memory.recent_summary ?? ''}`)
  if (latestSummaries && latestSummaries.length) parts.push(`Context from last chapters: ${latestSummaries.join(' | ')}`)

  function choose<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)] }

  const scenarioPools = [
    'a confrontation at a wedding reception',
    'an accusation in a crowded office',
    'a public reprimand during a live broadcast',
    'a betrayal exposed at a family dinner',
    'a humiliating award ceremony moment'
  ]

  const humiliationPools = DRAMA_POOLS.humiliation
  const antagonistPools = DRAMA_POOLS.antagonist
  const revealPools = DRAMA_POOLS.reveal
  const cliffhangerPools = CLIFFHANGER_POOLS

  const hookPools = HOOK_POOLS

  if (!userPrompt || String(userPrompt).trim() === '') {
    const scen = choose(scenarioPools)
    const hum = choose(humiliationPools)
    const ant = choose(antagonistPools)
    const rev = choose(revealPools)
    const cliff = choose(cliffhangerPools)
    const hook = choose(hookPools[genre?.id as any] ?? hookPools.default)

    // The seed must be concrete: scene + antagonist action + visible humiliation + hinted reveal + cliffhanger
    userPrompt = `${scen}; ${ant} ${hum}. ${hook}. A secret (${rev}) is hinted. End setup with a seed for a cliffhanger: ${cliff}`
  }

  parts.push(`User prompt: ${userPrompt}`)

  // Strong instruction set to ensure consistent, retention-first output.
  // inject genre personality if available
  const personality = GENRE_PERSONALITIES[genre?.id as any]
  if (personality && personality.length) {
    parts.push(`Personality: ${personality.join(', ')}`)
  }
  // inject few-shot style examples (2-3 random) to nudge micro-style
  try {
    const ex = FEW_SHOT_STYLE_EXAMPLES[genre?.id as any] || FEW_SHOT_STYLE_EXAMPLES.system || []
    if (ex && ex.length) {
      // pick 2 random
      const pick = [] as string[]
      while (pick.length < 2 && pick.length < ex.length) {
        const s = ex[Math.floor(Math.random() * ex.length)]
        if (!pick.includes(s)) pick.push(s)
      }
      if (pick.length) parts.push(`StyleExamples:\n${pick.join('\n\n')}`)
    }
  } catch (e) {}
  // inject character rules if present
  const charRules = CHARACTER_RULES[genre?.id as any]
  if (charRules) {
    parts.push(`CharacterProfile: ${JSON.stringify(charRules)}`)
  }
  // inject villain profile if dna provides or from villain rules (chapterPipeline may attach villain_profile)
  if ((dna && (dna as any).villain_profile) ) {
    parts.push(`VillainProfile: ${JSON.stringify((dna as any).villain_profile)}`)
  }
  // inject payoff timing guidance if present
  if (dna && (dna as any).payoff_stage) {
    const ps = (dna as any).payoff_stage
    parts.push(`PayoffStage: ${ps}`)
    // rules: don't full payoff too early
    parts.push('PayoffRules: do not resolve full_payoff early; chapter build ratio: buildup 70%, payoff 30%; reveal only partial; keep unresolved tension')
  }
  // inject continuity context if present
  if (dna && (dna as any).continuity) {
    const c = (dna as any).continuity
    parts.push(`Continuity: unresolved_conflict=${String(c.unresolved_conflict || '')}; latest_cliff=${String(c.latest_cliffhanger||'')}; emotions=${JSON.stringify(c.latest_emotional_state||[])}; villain_adv=${String(c.villain_current_advantage||'')}; protagonist_goal=${String(c.protagonist_current_goal||'')}`)
    parts.push('ContinuityRules: continue previous scene; do not reset emotions; keep unresolved conflicts visible; preserve dialogue/personality continuity')
  }
  // Minimal system instruction: require a single valid JSON object output.
  parts.push('INSTRUCTIONS: Return exactly one valid JSON object (no markdown, no extra text). The object must contain these fields: title, content, summary, cliffhanger, important_events, emotion_tags, story_memory_updates. content must be the chapter text only.')

  // Strong dialogue patterns to nudge model toward punchy, humiliating lines
  const STRONG_DIALOGUE = [
    'Quỳ xuống.',
    'Cô nghĩ mình xứng à?',
    'Đuổi cô ta ra ngoài.',
    'Im lặng đi.',
    'Ai cho phép cô nói vậy?',
  ]
  parts.push(`DialoguePatterns: ${STRONG_DIALOGUE.join(' | ')}`)

  return parts.join('\n\n')
}
