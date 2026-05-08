import type { GeneratePayload, ModelKey, NormalizedGeneratePayload, StoryEditorMode } from './types.js'
import { safeNumber, safeStringArray, safeText } from './textUtils.js'
import { normalizeMotifFingerprintArray, normalizeStorySeed } from './storyPlanUtils.js'

const DEFAULT_CHAPTER_MIN_CHARS = 3500
const DEFAULT_CHAPTER_MAX_CHARS = 4500

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.min(max, Math.round(value)))
}

function normalizeChapterMinChars(body: GeneratePayload) {
  const raw = safeNumber(body.chapterMinChars, DEFAULT_CHAPTER_MIN_CHARS)
  return clampNumber(raw, 1000, 12000)
}

function normalizeChapterMaxChars(body: GeneratePayload, minChars: number) {
  const raw = safeNumber(body.chapterMaxChars, DEFAULT_CHAPTER_MAX_CHARS)
  return clampNumber(raw, minChars, 15000)
}

function buildChapterLengthLabel(body: GeneratePayload, minChars: number, maxChars: number) {
  const explicitLabel = safeText(body.chapterLengthLabel, '')

  if (body.chapterMinChars || body.chapterMaxChars) {
    return `Tùy chỉnh — khoảng ${minChars}–${maxChars} ký tự`
  }

  return explicitLabel || `Tùy chỉnh — khoảng ${minChars}–${maxChars} ký tự`
}

export function createNameSeed() {
  const cryptoApi = globalThis.crypto

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}


function normalizeStoryEditorMode(body: GeneratePayload): StoryEditorMode {
  if (body.storyEditorMode === 'off' || body.storyEditorMode === 'standard' || body.storyEditorMode === 'careful') {
    return body.storyEditorMode
  }

  // Tương thích cấu hình cũ dạng checkbox.
  if (body.storyEditorPassEnabled === false) return 'off'
  if (body.storyEditorPassEnabled === true) return 'standard'

  return 'standard'
}

export function normalizeModelKey(body: GeneratePayload): ModelKey {
  if (body.modelKey === 'premium' || body.modelKey === 'auto' || body.modelKey === 'economy') {
    return body.modelKey
  }

  if (body.modelTier === 'premium') return 'premium'
  if (body.modelTier === 'auto') return 'auto'

  return 'economy'
}

export function normalizePayload(body: GeneratePayload): NormalizedGeneratePayload {
  const chapterMinChars = normalizeChapterMinChars(body)
  const chapterMaxChars = normalizeChapterMaxChars(body, chapterMinChars)

  return {
    mode: body.mode === 'story-plan' ? 'story-plan' : 'chapter',
    modelKey: normalizeModelKey(body),
    nameSeed: createNameSeed(),
    moduleId: safeText(body.moduleId, 'female-urban-viral'),
    title: safeText(body.title, 'Truyện mới từ AI Writer'),
    storySummary: safeText(body.storySummary, ''),
    promptIdea: safeText(body.promptIdea, ''),
    genreLabel: safeText(body.genreLabel, 'Hôn nhân phản bội / ngoại tình'),
    mainCharacterStyleLabel: safeText(body.mainCharacterStyleLabel, 'Nhẫn nhịn rồi phản công'),
    chapterLengthLabel: buildChapterLengthLabel(body, chapterMinChars, chapterMaxChars),
    chapterMinChars,
    chapterMaxChars,
    cliffhangerLabel: safeText(body.cliffhangerLabel, 'auto'),
    humiliationLevel: safeNumber(body.humiliationLevel, 3),
    revengeIntensity: safeNumber(body.revengeIntensity, 3),
    nextChapterNumber: Math.max(1, Math.floor(safeNumber(body.nextChapterNumber, 1))),
    chapterTarget: Math.max(
      0,
      Math.floor(safeNumber(body.chapterTarget ?? body.targetChapters, 0)),
    ),
    storyMemory: safeText(body.storyMemory, ''),
    recentChapters: Array.isArray(body.recentChapters) ? body.recentChapters : [],
    avoidStoryTitles: safeStringArray(body.avoidStoryTitles, 50),
    avoidMotifs: safeStringArray(body.avoidMotifs, 80),
    avoidMotifTexts: safeStringArray(body.avoidMotifTexts, 80),
    avoidMotifFingerprints: normalizeMotifFingerprintArray(body.avoidMotifFingerprints),
    avoidCharacterNames: safeStringArray(body.avoidCharacterNames, 80),
    avoidCompanyNames: safeStringArray(body.avoidCompanyNames, 50),
    factoryRunId: safeText(body.factoryRunId, ''),
    storyIndex: Math.max(0, Math.floor(safeNumber(body.storyIndex, 0))),
    storySeed: normalizeStorySeed(body.storySeed),
    storyEditorMode: normalizeStoryEditorMode(body),
  }
}