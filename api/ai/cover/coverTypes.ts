export type JsonRecord = Record<string, any>

export type CoverArtStyleKey =
  | 'auto'
  | 'anime_cinematic'
  | 'manga_manhwa'
  | 'cinematic_realistic'
  | 'popular_webnovel_collage'
  | 'ancient_chinese_cinematic_romance'

export type CoverCompositionPreset =
  | 'auto'
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
  coverArtStyle?: string
  coverCompositionPreset?: CoverCompositionPreset | string
  suggestedCoverSceneType?: CoverSceneType | string
  currentChapterCount?: number
  targetChapters?: number
  coverBrief?: string
  chapterTitles?: string[]
  chapters?: any[]
}

export interface CoverBuildResult {
  prompt: string
  fallbackPrompt: string
  coverConcept: CoverConcept | JsonRecord
}
