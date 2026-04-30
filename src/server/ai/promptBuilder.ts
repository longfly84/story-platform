import { GENRE_REGISTRY } from '@/lib/storyEngine'

export function buildPrompt({ genreId, dna, memory, latestSummaries, userPrompt }: { genreId?: string, dna?: any, memory?: any, latestSummaries?: string[], userPrompt?: string }) {
  const genre = GENRE_REGISTRY.find(g => g.id === genreId)
  const parts: string[] = []
  if (genre) parts.push(`Genre: ${genre.label} - ${genre.description}`)
  if (dna) parts.push(`DNA: ${JSON.stringify(dna)}`)
  if (memory) parts.push(`Memory summary: ${memory.recent_summary ?? ''}`)
  if (latestSummaries && latestSummaries.length) parts.push(`Context from last chapters: ${latestSummaries.join(' | ')}`)
  // If no user prompt provided, auto-generate a focused scene seed using genre palettes
  function choose<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)] }

  const scenarioPools = [
    'a confrontation at a wedding reception',
    'an accusation in a crowded office',
    'a public reprimand during a live broadcast',
    'a betrayal exposed at a family dinner',
    'a humiliating award ceremony moment'
  ]
  const humiliationPools = [
    'tripped and spilled drink on stage',
    'humiliated by a leaked secret in front of coworkers',
    'falsely accused and shouted down publicly',
    'a private message projected live',
    'a photo used to shame them in public'
  ]
  const antagonistPools = [
    'a polished rival who smiles while cutting you down',
    'an influential in-law who controls gossip',
    'a charismatic boss who hides malice behind compliments',
    'a charming ex who plays audience like a puppet'
  ]
  const revealPools = [
    'a hidden ledger',
    'a whispered confession caught on camera',
    'an unsigned letter that changes everything',
    'a text message thread exposing alliances'
  ]
  const cliffhangerPools = [
    'the lights go out and someone screams',
    'a gunshot rings nearby',
    'the antagonist collapses unexpectedly',
    'a key witness disappears into the crowd',
    'a phone buzzes with a message: "I know what you did."'
  ]

  if (!userPrompt || String(userPrompt).trim() === '') {
    const scen = choose(scenarioPools)
    const hum = choose(humiliationPools)
    const ant = choose(antagonistPools)
    const rev = choose(revealPools)
    const cliff = choose(cliffhangerPools)

    // build a compact scene seed that the AI will use as the main scene (cold open)
    userPrompt = `${scen}; ${ant} triggers a ${hum}. A secret (${rev}) is hinted. End setup with a seed for a cliffhanger: ${cliff}`
  }

  parts.push(`User prompt: ${userPrompt}`)

  // Accept dna+scenario injection if provided by caller
  if ((dna as any)?.story_dna) {
    // noop - placeholder for future
  }

  // Strong instruction set to ensure consistent, production-ready output.
  parts.push([
    'INSTRUCTIONS:',
    '- Use the user prompt / idea as the MAIN SCENE and start the chapter IN MEDIA RES (no lead-in summary).',
    '- Write in first-person narration. Do NOT include an opening summary or meta commentary.',
    '- Open with a strong hook sentence that drops the reader directly into the scene.',
    '- Keep sentences short and paragraphs short. Favor many short lines.',
    '- Use frequent dialogue; dialogue should drive scenes and reveal character.',
    "- Include a public humiliation scene (explicit, shown), but keep the main character outwardly calm and restrained.",
    '- Avoid lines like "I decide to take revenge" or any explicit declaration of revenge plans.',
    '- Ensure the final line is a SPECIFIC cliffhanger EVENT (concrete happening, not a vague sentence).',
    '- Tone: tense, character-driven, realistic beats; main remains composed even when humiliated.',
    '- Output MUST be structured exactly with these fields: title, content, summary, cliffhanger, important_events, emotion_tags.',
    '- content should contain the full chapter text (with dialogue and the humiliation scene).',
    '- summary should be a 1-2 sentence concise description (no framing), and cliffhanger should be a single-line description of the final event.',
  ].join(' '))

  return parts.join('\n\n')
}
