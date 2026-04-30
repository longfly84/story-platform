// Minimal genre personality presets for prompt injection
export const GENRE_PERSONALITIES: Record<string, string[]> = {
  family_revenge: [
    'tense',
    'emotional betrayal',
    'inner monologue heavy',
    'sharp dialogue',
    'humiliation escalation'
  ],
  workplace_revenge: [
    'cold ambition',
    'cutting dialogue',
    'fast pacing',
    'public stakes'
  ],
  school_betrayal: [
    'youthful voice',
    'rumor-driven tension',
    'short emotional beats',
    'relatable shame'
  ],
  hidden_authority: [
    'suspense',
    'environmental detail',
    'paranoia',
    'clipped sentences'
  ],
  toxic_family: [
    'intimate voice',
    'trauma undercurrent',
    'slow burn resentment',
    'sharp barbs in dialogue'
  ],
  urban_romance: [
    'softer narration',
    'emotional tension',
    'flirting dialogue',
    'slower pacing'
  ],
}

export default GENRE_PERSONALITIES
