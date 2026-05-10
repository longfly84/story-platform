import type { FactoryStorySeed } from '../aiFactoryTypes'
import { safeString } from './factoryPanelText'

export function normalizeFactoryTitleText(value: unknown) {
  return safeString(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getFactorySeedEvidence(storySeed?: FactoryStorySeed | null) {
  return safeString((storySeed as any)?.evidenceObject || (storySeed as any)?.motifFingerprint?.evidenceObject)
}

export function titleCaseFactoryEvidence(input: string) {
  return input
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => {
      if (!word) return word
      if (/^(USB|QR|ADN|CEO|VIP)$/i.test(word)) return word.toUpperCase()
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

export function hasFactoryEvidenceState(input: string) {
  const normalized = ` ${normalizeFactoryTitleText(input)} `
  return [
    ' bi ',
    ' co ',
    ' lech',
    ' sai',
    ' rach',
    ' xe ',
    ' roi',
    ' mat',
    ' bong',
    ' doi',
    ' sua',
    ' cat',
    ' gui nham',
    ' quay nham',
  ].some((marker) => normalized.includes(marker))
}

export function cleanFactoryEvidenceForTitle(input: string) {
  return safeString(input)
    .replace(/^một\s+/i, '')
    .replace(/^một chiếc\s+/i, 'Chiếc ')
    .replace(/^một tấm\s+/i, 'Tấm ')
    .replace(/^một mẩu\s+/i, 'Mẩu ')
    .replace(/\s+có một chi tiết lệch.*$/i, '')
    .replace(/\s+co mot chi tiet lech.*$/i, '')
    .replace(/\s+mà chỉ.*$/i, '')
    .replace(/\s+ma chi.*$/i, '')
    .replace(/\s+không phải.*$/i, '')
    .replace(/\s+khong phai.*$/i, '')
    .replace(/\s+theo công thức.*$/i, '')
    .replace(/\s+theo cong thuc.*$/i, '')
    .replace(/\s+bị đặt sai chỗ$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isBadFactoryStoryTitle(title: string) {
  const normalized = normalizeFactoryTitleText(title)

  return [
    'manh moi o hien truong',
    'chua dat ten',
    'vat chung bi dat sai cho',
    'mon qua bi lo',
    'ma qr dan toi thu muc an',
    'dong ma trong ho so cu',
    'cuoc goi tu so may la',
    'tu duong mo lai ho so cu',
    'dau chi khac mau',
    'tam the phong bi bo quen',
    'the phong quet luc nua dem',
    'dau quet tren the phong',
  ].includes(normalized)
}

export function makePanelTitleFromEvidence(storySeed?: FactoryStorySeed | null) {
  const evidence = getFactorySeedEvidence(storySeed)
  const clean = cleanFactoryEvidenceForTitle(evidence)
  const title = titleCaseFactoryEvidence(clean)

  if (title && title.length <= 48) {
    return hasFactoryEvidenceState(title) ? title : `${title} Bị Lộ`
  }

  const shortTitle = title.split(/\s+/).slice(0, 7).join(' ').trim()
  if (shortTitle && shortTitle.length >= 8) {
    return hasFactoryEvidenceState(shortTitle) ? shortTitle : `${shortTitle} Bị Lộ`
  }

  return 'Chi Tiết Bị Đặt Sai'
}


export function resolvePanelStoryTitle(params: {
  storySeed?: FactoryStorySeed | null
  parsedTitle: string
}) {
  const seedTitle = safeString(params.storySeed?.title)
  const parsedTitle = safeString(params.parsedTitle)
  const evidenceTitle = makePanelTitleFromEvidence(params.storySeed)

  const chosen =
    evidenceTitle && !isBadFactoryStoryTitle(evidenceTitle)
      ? evidenceTitle
      : seedTitle && !isBadFactoryStoryTitle(seedTitle)
        ? seedTitle
        : parsedTitle && !isBadFactoryStoryTitle(parsedTitle)
          ? parsedTitle
          : evidenceTitle || 'Chi Tiết Bị Đặt Sai'

  return {
    title: chosen,
    changed: normalizeFactoryTitleText(chosen) !== normalizeFactoryTitleText(seedTitle || parsedTitle),
    original: seedTitle || parsedTitle,
    evidenceTitle,
  }
}
