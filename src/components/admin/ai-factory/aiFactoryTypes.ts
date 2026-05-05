export type FactoryProvider = 'mock' | 'openai'
export type FactoryModelKey = 'economy' | 'premium' | 'auto'

export type FactoryStatus =
  | 'idle'
  | 'running'
  | 'success'
  | 'failed'
  | 'stopped'

export type FactoryJobStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'stopped'

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
  autoCompleteByTarget: boolean
  delayMs: number
  generateCover: boolean
  storyStatus: 'draft'
  chapterStatus: 'draft'
  chapterLengthLabel: string
  cliffhangerLabel: string
}

export type StoryMotifFingerprint = {
  premiseFamily?: string
  openingArena?: string
  incitingIncident?: string
  evidenceType?: string
  evidenceObject?: string
  villainAttackType?: string
  heroineCounterType?: string
  powerStructure?: string
  publicPressure?: string
  emotionalWound?: string
  hiddenTruthType?: string
  mainArena?: string
  secondaryArena?: string
  relationshipCore?: string
  twistEngine?: string
  deadlineStyle?: string
  endingPromise?: string
  antiRepeatTags?: string[]
  fingerprint?: string
}

export type StoryMotifRegistryItem = {
  storyId?: string
  title?: string
  motifText: string
  fingerprint: StoryMotifFingerprint
  embedding?: number[]
  source?: 'story_dna' | 'registry' | 'generated' | 'manual'
}

export type StoryMotifSimilarityResult = {
  item: StoryMotifRegistryItem
  fieldScore: number
  embeddingScore: number
  hybridScore: number
  matchedFields: string[]
  matchedTags: string[]
}

export type ExistingStory = {
  id: string
  title: string | null
  description: string | null
  genres?: string[] | string | null
  story_dna?: unknown
  story_memory?: unknown
  completion_status?: string | null
  target_chapters?: number | null
  created_at?: string | null
}

export type AvoidLibrary = {
  titles: string[]
  motifs: string[]
  characterNames: string[]
  companyNames: string[]
  motifFingerprints?: StoryMotifRegistryItem[]
  motifTexts?: string[]
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
  coverUrl?: string
  targetChapters?: number
  createdChapters?: number
  completionStatus?: 'ongoing' | 'full'
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

export type FactoryStorySeed = {
  title: string
  genreBlend: string[]
  corePremise: string
  openingScene: string
  incitingIncident: string
  evidenceObject: string
  mainConflict: string
  hiddenTruth: string
  setting: string
  villainType: string
  heroineArc: string
  emotionalHook: string
  powerStructure: string
  publicPressure: string
  shortFingerprint: string
  antiRepeatTags: string[]

  motifFingerprint?: StoryMotifFingerprint
  motifText?: string
  motifEmbedding?: number[]
  motifSimilarity?: StoryMotifSimilarityResult | null
}