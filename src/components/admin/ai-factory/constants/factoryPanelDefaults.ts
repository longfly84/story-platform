import type { AIFactoryConfig } from '../aiFactoryTypes'

export const defaultConfig: AIFactoryConfig = {
  provider: 'mock',
  modelKey: 'economy',
  storyCount: 1,
  batchSize: 5,
  chaptersToGenerateNow: 1,
  minTargetChapters: 10,
  maxTargetChapters: 20,
  delayMs: 2000,
  generateCover: false,
  storyEditorMode: 'standard',
  coverArtStyle: 'auto',
  coverCompositionPreset: 'auto',
  coverSceneType: 'auto_story_scene',
  autoCompleteByTarget: false,
  storyStatus: 'draft',
  chapterStatus: 'draft',
  chapterLengthLabel: 'Tùy chỉnh — khoảng 3500–4500 ký tự',
  chapterMinChars: 3500,
  chapterMaxChars: 4500,
  cliffhangerLabel: 'Mặc định — AI tự chọn theo mạch truyện',
}


export const STORY_SEED_MAX_ATTEMPTS = 10
