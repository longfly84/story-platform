import type { AIFactoryConfig } from '../aiFactoryTypes'

export function normalizeCoverArtStyle(value: unknown): AIFactoryConfig['coverArtStyle'] {
  const raw = String(value || '').trim()

  if (
    raw === 'auto' ||
    raw === 'anime_cinematic' ||
    raw === 'manga_manhwa' ||
    raw === 'cinematic_realistic' ||
    raw === 'popular_webnovel_collage' ||
    raw === 'ancient_chinese_cinematic_romance'
  ) {
    return raw as AIFactoryConfig['coverArtStyle']
  }

  if (raw === 'anime-cinematic') return 'anime_cinematic'
  if (raw === 'modern-manhwa') return 'manga_manhwa'
  if (raw === 'manga-drama') return 'manga_manhwa'
  if (raw === 'semi-realistic') return 'cinematic_realistic'
  if (raw === 'movie-poster') return 'popular_webnovel_collage'
  if (raw === 'ancient-chinese-cinematic-romance') return 'ancient_chinese_cinematic_romance'
  if (raw === 'co-phong-ngon-tinh-dien-anh') return 'ancient_chinese_cinematic_romance'

  return 'auto'
}

export function normalizeCoverCompositionPreset(value: unknown): AIFactoryConfig['coverCompositionPreset'] {
  const raw = String(value || '').trim()

  if (raw === 'auto' || raw === 'story_scene_offset' || raw === 'luxury_collage') {
    return raw as AIFactoryConfig['coverCompositionPreset']
  }

  if (raw === 'story-scene-offset' || raw === 'wide_story_scene' || raw === 'environmental') {
    return 'story_scene_offset'
  }
  if (raw === 'narrative_collage' || raw === 'story_collage' || raw === 'luxury-collage') {
    return 'luxury_collage'
  }

  return 'auto'
}

export function getCoverArtStyleLabel(style: AIFactoryConfig['coverArtStyle']) {
  switch (normalizeCoverArtStyle(style)) {
    case 'anime_cinematic':
      return 'Anime — Chinese commercial webnovel cover, glossy mature anime-inspired Chinese webnovel beauty, luxury urban drama color'
    case 'manga_manhwa':
      return 'Manga — Chinese commercial webnovel cover, polished manga/manhua-inspired line art, luxury full-color rendering'
    case 'popular_webnovel_collage':
      return 'Chinese manhua luxury collage, layered storytelling, 3 to 7 story fragments, glossy premium Chinese webnovel cover'
    case 'cinematic_realistic':
      return 'Urban drama premium poster illustration, polished cinematic realism, luxury Chinese urban-drama cover'
    case 'ancient_chinese_cinematic_romance':
      return 'Ancient Chinese cinematic romance cover, semi-realistic xianxia / wuxia-inspired digital painting, moody lantern-lit atmosphere'
    case 'auto':
    default:
      return 'premium Chinese commercial webnovel cover, automatically matched to story content'
  }
}

export function getCoverCompositionPresetLabel(style: AIFactoryConfig['coverCompositionPreset']) {
  switch (normalizeCoverCompositionPreset(style)) {
    case 'story_scene_offset':
      return 'Story scene offset composition, heroine off-center, wider background, supporting cast and environment visible'
    case 'luxury_collage':
      return 'Luxury collage composition, one heroine anchor with layered mini-scenes and story fragments'
    case 'auto':
    default:
      return 'composition chosen automatically from story content'
  }
}
