import type { ExistingStory } from '../aiFactoryTypes'

export type FactoryMode = 'create-new' | 'continue-existing'
export type ContinueStatusFilter = 'draft' | 'published' | 'all'

export type ExistingChapterRow = {
  id?: string
  story_id?: string
  title?: string
  slug?: string
  content?: string
  summary?: string
  chapter_number?: number | null
  created_at?: string
}

export type IncompleteStory = ExistingStory & {
  slug?: string
  status?: string
  targetChapters: number
  currentChapters: number
  missingChapters: number
  nextChapterNumber: number
  chapters: ExistingChapterRow[]
}
