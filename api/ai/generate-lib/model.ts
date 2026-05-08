import type { NormalizedGeneratePayload } from './types.js'

function safeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeText(value: unknown) {
  return safeText(value).toLowerCase()
}

function safeModelName(value: unknown, fallback: string) {
  const model = safeText(value)

  if (!model) return fallback

  return model
}

export function getLengthRule(chapterLengthLabel: string) {
  const normalized = chapterLengthLabel.toLowerCase()

  if (
    normalized.includes('ngắn') ||
    normalized.includes('short') ||
    normalized.includes('1.800') ||
    normalized.includes('1800')
  ) {
    return {
      label: chapterLengthLabel,
      readerLength: 'khoảng 1.800–2.500 ký tự cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ',
      maxOutputTokens: 5600,
    }
  }

  if (
    normalized.includes('dài') ||
    normalized.includes('long') ||
    normalized.includes('3.500') ||
    normalized.includes('3500') ||
    normalized.includes('4.500') ||
    normalized.includes('4500')
  ) {
    return {
      label: chapterLengthLabel,
      readerLength: 'khoảng 3.500–4.500 ký tự cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ',
      maxOutputTokens: 9800,
    }
  }

  return {
    label: chapterLengthLabel,
    readerLength: 'khoảng 2.500–3.500 ký tự cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ',
    maxOutputTokens: 7800,
  }
}

function getCurrentChapterPlanText(payload: NormalizedGeneratePayload) {
  const chapterPlan = payload.storySeed?.storyPlan?.chapterPlan

  if (!Array.isArray(chapterPlan)) return ''

  const currentPlan = chapterPlan.find(
    (chapter) => Number(chapter.chapterNumber) === Number(payload.nextChapterNumber),
  )

  if (!currentPlan) return ''

  return [
    currentPlan.title,
    currentPlan.mission,
    currentPlan.sceneType,
    currentPlan.mainScene,
    currentPlan.evidenceBeat,
    currentPlan.villainBeat,
    currentPlan.heroineMove,
    currentPlan.emotionalBeat,
    currentPlan.powerShift,
    currentPlan.endingHook,
  ]
    .map(safeText)
    .filter(Boolean)
    .join(' ')
}

export function isImportantChapter(payload: NormalizedGeneratePayload) {
  const cliffhanger = normalizeText(payload.cliffhangerLabel)
  const genreLabel = normalizeText(payload.genreLabel)
  const characterStyle = normalizeText(payload.mainCharacterStyleLabel)
  const promptIdea = normalizeText(payload.promptIdea)
  const title = normalizeText(payload.title)
  const storySummary = normalizeText(payload.storySummary)
  const storyMemory = normalizeText(payload.storyMemory)
  const seedText = normalizeText(payload.storySeed?.corePremise)
  const chapterPlanText = normalizeText(getCurrentChapterPlanText(payload))

  const haystack = [
    cliffhanger,
    genreLabel,
    characterStyle,
    promptIdea,
    title,
    storySummary,
    storyMemory,
    seedText,
    chapterPlanText,
  ].join(' ')

  const isOpeningChapter = payload.nextChapterNumber === 1

  const isNearEnding =
    payload.chapterTarget > 0 &&
    payload.nextChapterNumber >= Math.max(1, payload.chapterTarget - 1)

  if (isOpeningChapter) return true
  if (isNearEnding) return true
  if (payload.humiliationLevel >= 4) return true
  if (payload.revengeIntensity >= 4) return true

  return (
    haystack.includes('cao trào') ||
    haystack.includes('final') ||
    haystack.includes('kết') ||
    haystack.includes('kết liễu') ||
    haystack.includes('vả mặt công khai') ||
    haystack.includes('vả mặt') ||
    haystack.includes('pháp lý đảo chiều') ||
    haystack.includes('đảo chiều') ||
    haystack.includes('twist') ||
    haystack.includes('plot twist') ||
    haystack.includes('phản công') ||
    haystack.includes('lật kèo') ||
    haystack.includes('bóc trần') ||
    haystack.includes('lộ sự thật') ||
    haystack.includes('sự thật') ||
    haystack.includes('họp báo') ||
    haystack.includes('hot search') ||
    haystack.includes('livestream') ||
    haystack.includes('phiên tòa') ||
    haystack.includes('tòa án') ||
    haystack.includes('đối chất') ||
    haystack.includes('đối đầu') ||
    haystack.includes('chương cuối') ||
    haystack.includes('ending hook') ||
    haystack.includes('power shift') ||
    haystack.includes('villain beat') ||
    haystack.includes('payoff')
  )
}

export function getTextModel(payload: NormalizedGeneratePayload) {
  const economyModel = safeModelName(process.env.OPENAI_MODEL_ECONOMY, 'gpt-5-mini')
  const premiumModel = safeModelName(process.env.OPENAI_MODEL_PREMIUM, 'gpt-5.5')

  if (payload.modelKey === 'premium') {
    return premiumModel
  }

  if (payload.modelKey === 'auto') {
    return isImportantChapter(payload) ? premiumModel : economyModel
  }

  return economyModel
}

export function getStoryEditorMode(payload: NormalizedGeneratePayload) {
  if (payload.mode !== 'chapter') return 'off'

  const disabled = process.env.DISABLE_STORY_EDITOR_PASS
  if (disabled === 'true' || disabled === '1') return 'off'

  if (payload.storyEditorMode === 'off' || payload.storyEditorMode === 'standard' || payload.storyEditorMode === 'careful') {
    return payload.storyEditorMode
  }

  return 'standard'
}

export function getStoryEditorPassEnabled(payload: NormalizedGeneratePayload) {
  return getStoryEditorMode(payload) !== 'off'
}

export function getStoryEditorRepairEnabled(payload: NormalizedGeneratePayload) {
  return getStoryEditorMode(payload) === 'careful'
}
