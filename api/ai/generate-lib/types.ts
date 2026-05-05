export type GenerateMode = 'chapter' | 'story-plan'
export type ModelKey = 'economy' | 'premium' | 'auto'
export type LegacyModelTier = 'draft' | 'premium' | 'auto'

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

export type FactoryStoryPlanChapter = {
  chapterNumber: number
  title: string
  mission: string
  sceneType: string
  mainScene: string
  evidenceBeat: string
  villainBeat: string
  heroineMove: string
  emotionalBeat: string
  powerShift: string
  endingHook: string
}

export type FactoryStoryPlan = {
  plannerVersion?: string
  totalPlannedChapters?: number
  plannerGoal?: string
  evidencePlan?: string[]
  villainCurve?: string[]
  payoffPlan?: string[]
  chapterPlan?: FactoryStoryPlanChapter[]
}

export type FactoryStorySeed = {
  title?: string
  genreBlend?: string[]
  corePremise?: string
  openingScene?: string
  incitingIncident?: string
  evidenceObject?: string
  mainConflict?: string
  hiddenTruth?: string
  setting?: string
  villainType?: string
  heroineArc?: string
  emotionalHook?: string
  powerStructure?: string
  publicPressure?: string
  shortFingerprint?: string
  antiRepeatTags?: string[]
  motifFingerprint?: StoryMotifFingerprint
  motifText?: string
  motifEmbedding?: number[]
  motifSimilarity?: unknown
  storyPlan?: FactoryStoryPlan
}

export type GeneratePayload = {
  mode?: GenerateMode
  modelKey?: ModelKey
  modelTier?: LegacyModelTier
  moduleId?: string
  title?: string
  storySummary?: string
  promptIdea?: string
  genreLabel?: string
  mainCharacterStyleLabel?: string
  chapterLengthLabel?: string
  chapterMinChars?: number
  chapterMaxChars?: number
  cliffhangerLabel?: string
  humiliationLevel?: number
  revengeIntensity?: number
  nextChapterNumber?: number
  chapterTarget?: number
  targetChapters?: number
  storyMemory?: string
  recentChapters?: Array<{
    title?: string
    summary?: string
    content?: string
  }>
  avoidStoryTitles?: string[]
  avoidMotifs?: string[]
  avoidMotifTexts?: string[]
  avoidMotifFingerprints?: StoryMotifFingerprint[]
  avoidCharacterNames?: string[]
  avoidCompanyNames?: string[]
  factoryRunId?: string
  storyIndex?: number
  storySeed?: FactoryStorySeed | null
}

export type NormalizedGeneratePayload = {
  mode: GenerateMode
  modelKey: ModelKey
  nameSeed: string
  moduleId: string
  title: string
  storySummary: string
  promptIdea: string
  genreLabel: string
  mainCharacterStyleLabel: string
  chapterLengthLabel: string
  chapterMinChars: number
  chapterMaxChars: number
  cliffhangerLabel: string
  humiliationLevel: number
  revengeIntensity: number
  nextChapterNumber: number
  chapterTarget: number
  storyMemory: string
  recentChapters: Array<{
    title?: string
    summary?: string
    content?: string
  }>
  avoidStoryTitles: string[]
  avoidMotifs: string[]
  avoidMotifTexts: string[]
  avoidMotifFingerprints: StoryMotifFingerprint[]
  avoidCharacterNames: string[]
  avoidCompanyNames: string[]
  factoryRunId: string
  storyIndex: number
  storySeed: FactoryStorySeed | null
}
