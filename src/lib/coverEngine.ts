export const COVER_STYLES = [
  'Minimal Portrait',
  'Epic Cinematic',
  'Character Close-up',
  'Symbolic Emblem',
]

export const COLOR_THEMES = [
  'Warm Gold',
  'Cold Blue',
  'High Contrast',
  'Monochrome',
]

export const CHARACTER_VIBES = [
  'Stoic',
  'Vengeful',
  'Playful',
  'Melancholic',
]

export function buildCoverPrompt(storyDNA: any, opts?: { style?: string, color?: string, vibe?: string }) {
  const style = opts?.style || COVER_STYLES[0]
  const color = opts?.color || COLOR_THEMES[0]
  const vibe = opts?.vibe || CHARACTER_VIBES[0]

  // Build a mobile-friendly cover prompt in webnovel style
  const title = storyDNA?.storyType ? `${storyDNA.storyType} — ${storyDNA.mainStyle}` : 'Mystery Story'
  const hook = `Bold central subject, close-up on main character, first-person vibe, dopamine fiction energy.`
  const desc = `${style}, ${color} palette, cinematic lighting, clear subject focus, typography-safe composition, mobile thumbnail readable.`
  const mood = `Character vibe: ${vibe}. Emphasize conflict, humiliation cues, and a hint of revenge.`

  return `${title} | ${hook} ${desc} ${mood}`
}

export function buildNegativePrompt() {
  return 'blurry, lowres, text on image, watermarks, extra limbs, deformed, poorly drawn, NSFW'
}
