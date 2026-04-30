import { GENRE_REGISTRY } from '@/lib/storyEngine'
import { HOOK_POOLS, CLIFFHANGER_POOLS, DRAMA_POOLS } from '@/config/storyEngine/retentionPools'
import { GENRE_PERSONALITIES } from '@/config/storyEngine/genrePersonalities'
import { CHARACTER_RULES } from '@/config/storyEngine/characterRules'

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
  parts.push([
    'INSTRUCTIONS:',
    '- Use the user prompt / idea as the MAIN SCENE and start the chapter IN MEDIA RES (no lead-in summary).',
    '- Write in first-person narration. Do NOT include an opening summary or meta commentary or explain you are an AI.',
    '- Open with a strong, concrete hook (first 3 non-empty lines must include a clear incident + a humiliation OR danger OR betrayal OR shocking reveal).',
    '- Do NOT write in generic/plaintive phrases (see blacklist). Avoid vague statements like "Mọi thứ thay đổi" or "Từ ngày đó..."; be specific and show details.',
    '- Show actions and concrete sensory detail; include actions + at least one line of dialogue in the opening scene.',
    '- Keep sentences short and paragraphs short. Favor many short lines and frequent line breaks.',
    '- Prioritize tension every 2-3 paragraphs: introduce a small escalation or obstacle that raises stakes.',
    '- Use dialogue to reveal character and advance plot; aim for a high dialogue ratio.',
    '- Avoid repeating the same sentence or phrase; vary wording and beats; do not produce wall-of-text.',
    '- Include an explicit, shown humiliation scene (avoid internal monologue only). The protagonist should appear outwardly calm while feeling humiliated.',
    '- Avoid meta explanations like "I will take revenge"; show the planning through actions and clipped thoughts instead.',
    '- Ensure the final line is a SPECIFIC cliffhanger EVENT (concrete happening, not a vague sentence).',
    "- Output MUST be structured exactly with these fields: title, content, summary, cliffhanger, important_events, emotion_tags.",
    "- content should contain the full chapter text (with dialogue and the humiliation scene).",
    "- summary should be a 1-2 sentence concise description (no framing), and cliffhanger should be a single-line description of the final event.",
    '- BLACKLIST: do not use the following stock phrases verbatim: "Từ ngày đó", "Lòng tôi tràn ngập", "Mọi thứ thay đổi", "Cuộc sống tôi bỗng", "Tất cả thay đổi". If tempted, rephrase into concrete sensory detail.'
  ].join(' '))

  return parts.join('\n\n')
}
