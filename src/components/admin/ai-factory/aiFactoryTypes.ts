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

  /**
   * Tổng số truyện cần tạo trong một lần chạy Factory.
   */
  storyCount: number

  /**
   * Số truyện xử lý trong mỗi batch.
   */
  batchSize: number

  /**
   * Số chương tạo thật ngay mỗi truyện khi autoCompleteByTarget = false.
   */
  chaptersToGenerateNow: number

  /**
   * Số chương mục tiêu tối thiểu của toàn truyện.
   */
  minTargetChapters: number

  /**
   * Số chương mục tiêu tối đa của toàn truyện.
   */
  maxTargetChapters: number

  /**
   * Khi true:
   * - Factory random targetChapters trong khoảng min/max.
   * - Tạo đủ targetChapters chương cho từng truyện.
   * - Chương cuối phải kết truyện.
   * - Sau khi tạo đủ chương, story nên được lưu completion_status = 'full'.
   *
   * Khi false:
   * - Factory chỉ tạo chaptersToGenerateNow chương.
   * - min/max chỉ là kế hoạch để AI hiểu độ dài series.
   * - story nên giữ completion_status = 'ongoing'.
   */
  autoCompleteByTarget: boolean

  /**
   * Delay giữa các request AI.
   */
  delayMs: number

  /**
   * Có tạo cover bằng AI hay không.
   */
  generateCover: boolean

  /**
   * Trạng thái publish của story khi insert.
   * Hiện tại chỉ cho draft để kiểm duyệt trước khi public.
   */
  storyStatus: 'draft'

  /**
   * Trạng thái chapter khi insert.
   * Hiện tại chỉ cho draft để kiểm duyệt trước khi public.
   */
  chapterStatus: 'draft'

  /**
   * Nhãn độ dài chương dùng cho prompt.
   */
  chapterLengthLabel: string

  /**
   * Nhãn mức cliffhanger dùng cho prompt.
   */
  cliffhangerLabel: string
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

  /**
   * Số chương mục tiêu đã random cho truyện này.
   */
  targetChapters?: number

  /**
   * Số chương đã tạo thật cho truyện này.
   */
  createdChapters?: number

  /**
   * Trạng thái hoàn thành của truyện sau khi Factory chạy.
   */
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
}