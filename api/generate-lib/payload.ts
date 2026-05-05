import type { GeneratePayload, ModelKey, NormalizedGeneratePayload } from './types'
import { safeNumber, safeStringArray, safeText } from './textUtils'
import { normalizeMotifFingerprintArray, normalizeStorySeed } from './storyPlanUtils'

export function createNameSeed() {
  const cryptoApi = globalThis.crypto

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
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
    chapterLengthLabel: safeText(body.chapterLengthLabel, 'Vừa 2.500–3.500 ký tự'),
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
  }
}
