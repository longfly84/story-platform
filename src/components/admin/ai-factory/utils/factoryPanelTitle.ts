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
  return safeString(input)
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => {
      if (!word) return word

      const keepUpper = /^(USB|QR|ADN|CEO|VIP|PR|IP|ID|AI)$/i
      if (keepUpper.test(word)) return word.toUpperCase()

      const parts = word.split(/([\-/])/g)
      return parts
        .map((part) => {
          if (!part || part === '-' || part === '/') return part
          if (keepUpper.test(part)) return part.toUpperCase()
          return part.charAt(0).toLocaleUpperCase('vi-VN') + part.slice(1).toLocaleLowerCase('vi-VN')
        })
        .join('')
    })
    .join(' ')
}

export function normalizeFactoryStoryTitleForDisplay(input: unknown) {
  const clean = stripTechnicalTitleNotes(safeString(input))
    .replace(/\s+/g, ' ')
    .trim()

  if (!clean) return ''

  const titled = titleCaseFactoryEvidence(clean)

  return titled
    .replace(/\bbị\b/giu, 'Bị')
    .replace(/\bcó\b/giu, 'Có')
    .replace(/\bđược\b/giu, 'Được')
    .replace(/\bkhông\b/giu, 'Không')
    .replace(/\btrong\b/giu, 'Trong')
    .replace(/\btrên\b/giu, 'Trên')
    .replace(/\bdưới\b/giu, 'Dưới')
    .replace(/\bsau\b/giu, 'Sau')
    .replace(/\btrước\b/giu, 'Trước')
    .replace(/\s+/g, ' ')
    .trim()
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
    ' duoc ghim',
    ' co dau',
    ' co ky hieu',
    ' nhung con',
  ].some((marker) => normalized.includes(marker))
}

function endsWithIncompleteFactoryTitle(input: string) {
  const normalized = normalizeFactoryTitleText(input)

  return [
    'bi',
    'co',
    'co dau',
    'co ky hieu',
    'nhung',
    'nhung con',
    'bi cat nhung con',
    'co ky hieu ban bi',
    'khan an co ky hieu ban bi',
    'file am thanh bi cat nhung con',
    'ho so nhan con nuoi co dau',
  ].some((tail) => normalized.endsWith(tail))
}

function stripTechnicalTitleNotes(input: string) {
  return safeString(input)
    .replace(/["“”]/g, '')
    .replace(/\s*[—-]\s*KHÔNG KHỚP.*$/i, '')
    .replace(/\s*[—-]\s*KHONG KHOP.*$/i, '')
    .replace(/\s*\((?:không|khong)\s+(?:phản ánh|phan anh|phù hợp|phu hop|nên dùng|nen dung)[^)]*\)\s*$/i, '')
    .replace(/\s*\((?:không|khong)[^)]{0,80}\)\s*$/i, '')
    .replace(/^truyện mới từ ai writer\s*/i, '')
    .replace(/^truyen moi tu ai writer\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function cleanFactoryEvidenceForTitle(input: string) {
  return stripTechnicalTitleNotes(input)
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
    .replace(/\s+trước chỗ nữ chính$/i, '')
    .replace(/\s+truoc cho nu chinh$/i, '')
    .replace(/\s+trước mặt nữ chính$/i, '')
    .replace(/\s+truoc mat nu chinh$/i, '')
    .replace(/\s+ngay trước chỗ nữ chính$/i, '')
    .replace(/\s+ngay truoc cho nu chinh$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isBadFactoryStoryTitle(title: string) {
  const normalized = normalizeFactoryTitleText(title)

  if (!normalized) return true
  if (endsWithIncompleteFactoryTitle(title)) return true

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
    'truyen moi tu ai writer',
    'khan an co ky hieu ban bi',
    'file am thanh bi cat nhung con',
    'ho so nhan con nuoi co dau',
  ].includes(normalized)
}

function trimFactoryTitleToSafeLength(title: string) {
  const clean = safeString(title)
  if (!clean) return ''

  // Không cắt cụt title evidence ở ngưỡng quá ngắn.
  // Các title kiểu “File âm thanh bị cắt nhưng còn tiếng chuông đặc trưng”
  // hoặc “Hồ sơ nhận con nuôi có dấu ghim mới trên trang cũ” cần được giữ đủ nghĩa.
  if (clean.length <= 82) return clean

  const softCuts = [
    /\s+trước\s+.+$/i,
    /\s+ngay\s+trước\s+.+$/i,
    /\s+trong\s+khi\s+.+$/i,
    /\s+vì\s+.+$/i,
    /\s+để\s+.+$/i,
    /\s+mà\s+.+$/i,
  ]

  for (const pattern of softCuts) {
    const candidate = clean.replace(pattern, '').trim()
    if (candidate.length >= 18 && candidate.length <= 82 && !endsWithIncompleteFactoryTitle(candidate)) {
      return candidate
    }
  }

  const words = clean.split(/\s+/)
  for (let count = Math.min(words.length, 12); count >= 7; count -= 1) {
    const candidate = words.slice(0, count).join(' ').trim()
    if (candidate.length >= 18 && candidate.length <= 82 && !endsWithIncompleteFactoryTitle(candidate)) {
      return candidate
    }
  }

  return clean
}

export function makePanelTitleFromEvidence(storySeed?: FactoryStorySeed | null) {
  const evidence = getFactorySeedEvidence(storySeed)
  const clean = cleanFactoryEvidenceForTitle(evidence)
  const title = trimFactoryTitleToSafeLength(normalizeFactoryStoryTitleForDisplay(clean))

  if (title && !isBadFactoryStoryTitle(title)) {
    return hasFactoryEvidenceState(title) ? title : `${title} Bị Lộ`
  }

  const seedTitle = trimFactoryTitleToSafeLength(normalizeFactoryStoryTitleForDisplay(cleanFactoryEvidenceForTitle((storySeed as any)?.title)))
  if (seedTitle && !isBadFactoryStoryTitle(seedTitle)) {
    return hasFactoryEvidenceState(seedTitle) ? seedTitle : `${seedTitle} Bị Lộ`
  }

  return 'Chi Tiết Bị Đặt Sai'
}

export function resolvePanelStoryTitle(params: {
  storySeed?: FactoryStorySeed | null
  parsedTitle: string
}) {
  const seedTitle = trimFactoryTitleToSafeLength(normalizeFactoryStoryTitleForDisplay(cleanFactoryEvidenceForTitle(params.storySeed?.title || '')))
  const parsedTitle = trimFactoryTitleToSafeLength(normalizeFactoryStoryTitleForDisplay(cleanFactoryEvidenceForTitle(params.parsedTitle)))
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
