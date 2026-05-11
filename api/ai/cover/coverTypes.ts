export type JsonRecord = Record<string, any>

export type CoverArtStyleKey =
  | 'auto'

  // New cover style keys from AI Factory UI
  | 'anime_glossy'
  | 'manhwa_drama'
  | 'clean_webtoon_manhua'
  | 'cinematic_semi_realistic'
  | 'cinematic_realistic'
  | 'monochrome_collage'
  | 'promo_poster'

  // Legacy/internal compatibility
  | 'anime_cinematic'
  | 'manga_manhwa'
  | 'popular_webnovel_collage'
  | 'ancient_chinese_cinematic_romance'

export type CoverCompositionPreset =
  | 'auto'

  // New layout keys from AI Factory UI
  | 'single_heroine_center'
  | 'public_confrontation'
  | 'evidence_focus'
  | 'mother_child_protection'
  | 'betrayal_triangle'
  | 'collage_story_poster'

  // Legacy/internal compatibility
  | 'story_scene_offset'
  | 'luxury_collage'

export type CoverSceneType =
  | 'auto_story_scene'
  | 'collage_story_poster'
  | 'mother_child_protection'
  | 'evidence_discovery_scene'
  | 'public_reveal_confrontation'
  | 'private_betrayal_confrontation'
  | 'hospital_legal_suspense'
  | 'school_parent_conflict'
  | 'airport_secret_tension'
  | 'family_banquet_confrontation'
  | 'boardroom_evidence_reveal'

export type CoverImageQuality = 'medium' | 'high'

export type CoverStoryStage = 'early-hook' | 'mid-escalation' | 'late-payoff'

export interface CoverConcept {
  version: string
  coverArtStyle: CoverArtStyleKey
  sceneType: CoverSceneType
  storyStage: CoverStoryStage
  title: string
  genre: string
  heroine: string
  antagonist: string
  relationshipCore: string
  keyEvidence: string
  setting: string
  emotionalHook: string
  stakes: string
  moodKeywords: string
  chapterHints: string
  currentChapterCount: number
  targetChapters: number
}

export interface StoryInput {
  id?: string
  title: string
  summary?: string
  description?: string
  genre?: string
  genreLabel?: string
  genres?: string[]
  tags?: string[]
  slug?: string
  story_dna?: JsonRecord | string | null
  storyDna?: JsonRecord | string | null
  author?: string

  style?: string
  visual_style?: string
  cover_style?: string
  coverArtStyle?: CoverArtStyleKey | string
  cover_art_style?: CoverArtStyleKey | string

  coverQuality?: CoverImageQuality | string
  imageQuality?: CoverImageQuality | string
  quality?: CoverImageQuality | string

  coverCompositionPreset?: CoverCompositionPreset | string
  cover_composition_preset?: CoverCompositionPreset | string

  suggestedCoverSceneType?: CoverSceneType | string
  suggested_cover_scene_type?: CoverSceneType | string

  currentChapterCount?: number
  current_chapter_count?: number
  targetChapters?: number
  target_chapters?: number

  coverBrief?: string
  chapterTitles?: string[]
  chapter_titles?: string[]
  chapters?: any[]
}

export interface CoverBuildResult {
  prompt: string
  fallbackPrompt: string
  coverConcept: CoverConcept | JsonRecord
}