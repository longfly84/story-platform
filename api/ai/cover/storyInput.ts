import type { JsonRecord, StoryInput } from './coverTypes.js'
import { safeArray, safeString } from './coverText.js'

function safeNumber(value: unknown, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function safeChapterTitles(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (item && typeof item === 'object') {
        const chapter = item as Record<string, unknown>
        return safeString(chapter.title || chapter.name || chapter.chapter_title)
      }
      return ''
    })
    .filter(Boolean)
}

function normalizeCoverArtStyle(raw: string): string {
  const value = safeString(raw).trim().toLowerCase()
  if (!value) return 'auto'

  if (
    value === 'anime_cinematic' ||
    value === 'anime-cinematic' ||
    value === 'anime' ||
    value.includes('anime cinematic') ||
    value.includes('anime điện ảnh')
  ) {
    return 'anime_cinematic'
  }

  if (
    value === 'manga_manhwa' ||
    value === 'manga-manhwa' ||
    value === 'manga' ||
    value === 'manhwa' ||
    value.includes('manga') ||
    value.includes('manhwa')
  ) {
    return 'manga_manhwa'
  }

  if (
    value === 'cinematic_realistic' ||
    value === 'cinematic-realistic' ||
    value === 'realistic' ||
    value === 'semi-realistic' ||
    value === 'movie-poster' ||
    value.includes('cinematic') ||
    value.includes('realistic') ||
    value.includes('giống thật') ||
    value.includes('điện ảnh')
  ) {
    return 'cinematic_realistic'
  }

  if (
    value === 'popular_webnovel_collage' ||
    value === 'popular-webnovel-collage' ||
    value.includes('collage') ||
    value.includes('webnovel') ||
    value.includes('tiểu thuyết mạng') ||
    value.includes('ưa chuộng')
  ) {
    return 'popular_webnovel_collage'
  }

  if (
    value === 'ancient_chinese_cinematic_romance' ||
    value === 'ancient-chinese-cinematic-romance' ||
    value === 'co-phong-ngon-tinh-dien-anh' ||
    value === 'co_phong_ngon_tinh_dien_anh' ||
    value.includes('cổ phong') ||
    value.includes('co phong') ||
    value.includes('ngôn tình điện ảnh') ||
    value.includes('ngon tinh dien anh') ||
    value.includes('huyền huyễn') ||
    value.includes('huyen huyen') ||
    value.includes('xianxia') ||
    value.includes('wuxia')
  ) {
    return 'ancient_chinese_cinematic_romance'
  }

  return 'auto'
}

export function extractStoryInput(body: JsonRecord): StoryInput {
  const source = (body.story || body.storyData || body.payload || body) as Record<string, unknown>
  const storyDna = source.story_dna ?? source.storyDna ?? body.story_dna ?? body.storyDna ?? null
  const storyDnaRecord = storyDna && typeof storyDna === 'object' && !Array.isArray(storyDna)
    ? (storyDna as Record<string, unknown>)
    : {}

  const chapters = safeArray(source.chapters || body.chapters)
  const chapterTitles = safeChapterTitles(
    source.chapterTitles ||
      source.chapter_titles ||
      body.chapterTitles ||
      body.chapter_titles ||
      chapters,
  )

  const coverArtStyle = normalizeCoverArtStyle(
    safeString(
      source.coverArtStyle ||
        source.cover_art_style ||
        source.visual_style ||
        source.cover_style ||
        source.style ||
        body.coverArtStyle ||
        body.cover_art_style ||
        body.visual_style ||
        body.cover_style ||
        body.style,
    ),
  )

  const coverCompositionPreset = safeString(
    source.coverCompositionPreset ||
      source.cover_composition_preset ||
      body.coverCompositionPreset ||
      body.cover_composition_preset ||
      storyDnaRecord.coverCompositionPreset ||
      storyDnaRecord.cover_composition_preset,
  )

  const suggestedCoverSceneType = safeString(
    source.suggestedCoverSceneType ||
      source.suggested_cover_scene_type ||
      body.suggestedCoverSceneType ||
      body.suggested_cover_scene_type ||
      storyDnaRecord.suggestedCoverSceneType ||
      storyDnaRecord.suggested_cover_scene_type,
  )

  const currentChapterCount =
    safeNumber(
      source.currentChapterCount ||
        source.current_chapter_count ||
        source.chapterCount ||
        source.chapter_count ||
        body.currentChapterCount ||
        body.current_chapter_count ||
        body.chapterCount ||
        body.chapter_count,
      0,
    ) || chapters.length

  const targetChapters = safeNumber(
    source.targetChapters ||
      source.target_chapters ||
      body.targetChapters ||
      body.target_chapters ||
      storyDnaRecord.targetChapters ||
      storyDnaRecord.target_chapters,
    0,
  )

  return {
    id: safeString(source.id || body.storyId || body.id),
    title: safeString(source.title || body.title),
    summary: safeString(source.summary || body.summary || body.storySummary),
    description: safeString(source.description || source.desc || body.description || body.desc),
    genre: safeString(source.genre || body.genre),
    genreLabel: safeString(source.genreLabel || source.genre_label || body.genreLabel || body.genre_label),
    genres: safeArray(source.genres || body.genres),
    tags: safeArray(source.tags || body.tags),
    slug: safeString(source.slug || body.slug),
    story_dna: storyDna,
    storyDna,
    author: safeString(source.author || body.author),
    style: coverArtStyle,
    visual_style: coverArtStyle,
    cover_style: safeString(source.cover_style || body.cover_style),
    coverArtStyle,
    coverCompositionPreset,
    suggestedCoverSceneType,
    currentChapterCount,
    targetChapters,
    coverBrief: safeString(
      source.coverBrief ||
        source.cover_brief ||
        source.visualCoverBrief ||
        source.visual_cover_brief ||
        source.coverSceneBrief ||
        source.cover_scene_brief ||
        source.imagePromptBrief ||
        source.image_prompt_brief ||
        body.coverBrief ||
        body.cover_brief ||
        body.visualCoverBrief ||
        body.visual_cover_brief ||
        body.coverSceneBrief ||
        body.cover_scene_brief ||
        body.imagePromptBrief ||
        body.image_prompt_brief,
    ),
    chapterTitles,
    chapters,
  }
}

export function pickSummary(story: StoryInput): string {
  return (
    safeString(story.summary) ||
    safeString(story.description) ||
    safeString(story.coverBrief) ||
    ''
  )
}
