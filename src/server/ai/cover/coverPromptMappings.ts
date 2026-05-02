export type CoverPreset = {
  id: string
  label: string
  prompt: string
}

function normalizeKey(value?: string) {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const COVER_STYLE_MAP: Record<string, CoverPreset> = {
  'anime-drama': {
    id: 'anime-drama',
    label: 'Anime Drama',
    prompt:
      'high-detail anime cover illustration, emotional facial expressions, cinematic framing, polished web-novel cover quality, dramatic lighting, glossy premium finish',
  },
  'minimal-portrait': {
    id: 'minimal-portrait',
    label: 'Minimal Portrait',
    prompt:
      'clean portrait-focused cover, elegant composition, single-character emphasis, simple but premium visual hierarchy, refined illustration',
  },
  'luxury-wedding': {
    id: 'luxury-wedding',
    label: 'Luxury Wedding',
    prompt:
      'luxury wedding visual language, grand ballroom, crystal chandeliers, couture bridal fashion, glamorous and expensive atmosphere',
  },
  'corporate-queen': {
    id: 'corporate-queen',
    label: 'Corporate Queen',
    prompt:
      'modern elite corporate aesthetics, sharp fashion styling, wealthy urban atmosphere, confident female lead, premium executive aura',
  },
  'revenge-poster': {
    id: 'revenge-poster',
    label: 'Revenge Poster',
    prompt:
      'high-impact revenge drama poster style, visually bold composition, intense tension, striking contrast, viral web-fiction cover energy',
  },
}

const COLOR_THEME_MAP: Record<string, CoverPreset> = {
  'dark-luxury': {
    id: 'dark-luxury',
    label: 'Dark Luxury',
    prompt:
      'dark luxury color palette with black, charcoal, soft gold highlights, deep shadows, subtle champagne glow, premium elite atmosphere',
  },
  'warm-gold': {
    id: 'warm-gold',
    label: 'Warm Gold',
    prompt:
      'warm gold palette, golden highlights, soft amber light, elegant warm tones, luxurious romantic glow',
  },
  'cold-blue': {
    id: 'cold-blue',
    label: 'Cold Blue',
    prompt:
      'cold blue palette, steel-blue shadows, cool highlights, dramatic emotional distance, elegant urban chill',
  },
  'red-drama': {
    id: 'red-drama',
    label: 'Red Drama',
    prompt:
      'dramatic red accents, tension-heavy atmosphere, emotional intensity, high-conflict visual tone',
  },
  'black-amber': {
    id: 'black-amber',
    label: 'Black Amber',
    prompt:
      'black and amber palette, moody rich shadows, cinematic warmth, sophisticated drama look',
  },
}

const CHARACTER_VIBE_MAP: Record<string, CoverPreset> = {
  'broken-bride': {
    id: 'broken-bride',
    label: 'Broken Bride',
    prompt:
      'the heroine should look like a betrayed bride: emotionally wounded but still proud, graceful, cold-eyed, elegant, fragile on the surface yet internally dangerous',
  },
  'stoic': {
    id: 'stoic',
    label: 'Stoic',
    prompt:
      'the heroine should appear calm, restrained, composed, emotionally controlled, powerful through silence',
  },
  'cold-queen': {
    id: 'cold-queen',
    label: 'Cold Queen',
    prompt:
      'the heroine should appear untouchable, regal, elegant, cold, dominant, and high-status',
  },
  'elegant-revenge': {
    id: 'elegant-revenge',
    label: 'Elegant Revenge',
    prompt:
      'the heroine should appear refined, graceful, intelligent, and quietly vengeful, with a polished aristocratic aura',
  },
  'soft-but-dangerous': {
    id: 'soft-but-dangerous',
    label: 'Soft but Dangerous',
    prompt:
      'the heroine should look gentle at first glance but carry a hidden threat, sharp intelligence, and emotional danger underneath',
  },
}

const DEFAULT_COVER_STYLE = COVER_STYLE_MAP['anime-drama']
const DEFAULT_COLOR_THEME = COLOR_THEME_MAP['dark-luxury']
const DEFAULT_CHARACTER_VIBE = CHARACTER_VIBE_MAP['broken-bride']

export function resolveCoverStyle(value?: string): CoverPreset {
  return COVER_STYLE_MAP[normalizeKey(value)] ?? DEFAULT_COVER_STYLE
}

export function resolveColorTheme(value?: string): CoverPreset {
  return COLOR_THEME_MAP[normalizeKey(value)] ?? DEFAULT_COLOR_THEME
}

export function resolveCharacterVibe(value?: string): CoverPreset {
  return CHARACTER_VIBE_MAP[normalizeKey(value)] ?? DEFAULT_CHARACTER_VIBE
}