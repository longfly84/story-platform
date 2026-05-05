import type { NormalizedGeneratePayload } from './types'

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

export function getTextModel(payload: NormalizedGeneratePayload) {
  const economyModel =
    process.env.OPENAI_MODEL_ECONOMY ||
    process.env.OPENAI_MODEL_DRAFT ||
    process.env.OPENAI_MODEL ||
    'gpt-4.1-mini'

  const premiumModel =
    process.env.OPENAI_MODEL_PREMIUM ||
    process.env.OPENAI_MODEL_HIGH ||
    process.env.OPENAI_MODEL ||
    'gpt-4.1-mini'

  if (payload.modelKey === 'premium') return premiumModel

  if (payload.modelKey === 'auto') {
    const cliffhanger = payload.cliffhangerLabel.toLowerCase()

    const shouldUsePremium =
      payload.nextChapterNumber === 1 ||
      payload.humiliationLevel >= 4 ||
      payload.revengeIntensity >= 4 ||
      cliffhanger.includes('cao trào') ||
      cliffhanger.includes('final') ||
      cliffhanger.includes('kết') ||
      cliffhanger.includes('kết liễu') ||
      cliffhanger.includes('vả mặt công khai') ||
      cliffhanger.includes('pháp lý đảo chiều')

    return shouldUsePremium ? premiumModel : economyModel
  }

  return economyModel
}

export function getStoryEditorPassEnabled(payload: NormalizedGeneratePayload) {
  if (payload.mode !== 'chapter') return false

  const disabled = process.env.DISABLE_STORY_EDITOR_PASS
  if (disabled === 'true' || disabled === '1') return false

  return true
}
