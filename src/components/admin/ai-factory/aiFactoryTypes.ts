export type FactoryProvider = 'mock' | 'openai'
export type FactoryModelKey = 'economy' | 'premium' | 'auto'
export type FactoryStatus = 'idle' | 'running' | 'success' | 'failed' | 'stopped'
export type FactoryJobStatus = 'pending' | 'running' | 'success' | 'failed' | 'stopped'

export type FactoryGenreOption = {
  key: string
  label: string
  slug: string
}

export type FactoryHeroineOption = {
  key: string
  label: string
}

export type AIFactoryConfig = {
  provider: FactoryProvider
  modelKey: FactoryModelKey
  storyCount: number
  batchSize: number
  chaptersToGenerateNow: number
  minTargetChapters: number
  maxTargetChapters: number
  delayMs: number
  generateCover: boolean
  storyStatus: 'draft'
  chapterStatus: 'draft'
  chapterLengthLabel: string
  cliffhangerLabel: string
}

export type ExistingStory = {
  id: string
  title: string | null
  description: string | null
  genres?: string[] | string | null
  story_dna?: unknown
  story_memory?: unknown
  created_at?: string | null
}

export type AvoidLibrary = {
  titles: string[]
  motifs: string[]
  characterNames: string[]
  companyNames: string[]
}

export type FactoryLog = {
  id: string
  time: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export type FactoryJob = {
  id: string
  index: number
  title: string
  genreLabel: string
  genreSlug: string
  heroineLabel: string
  status: FactoryJobStatus
  chapterProgress: string
  coverStatus: 'off' | 'pending' | 'success' | 'failed' | 'skipped'
  error?: string
  storyId?: string
  storySlug?: string
}

export type ParsedChapterOutput = {
  raw: string
  readerOnly: string
  technicalReport: string
  storyTitle: string
  storySlug: string
  storyDescription: string
  chapterTitle: string
  chapterSlug: string
}

export type FactoryRunSnapshot = {
  config: AIFactoryConfig
  jobs: FactoryJob[]
  logs: FactoryLog[]
  status: FactoryStatus
  startedAt?: string
  finishedAt?: string
}