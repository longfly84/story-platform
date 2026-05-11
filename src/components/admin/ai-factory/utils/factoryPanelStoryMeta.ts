import { supabase } from '../../../../lib/supabase'
import type { FactoryStorySeed } from '../aiFactoryTypes'
import { makeId } from '../aiFactoryUtils'
import { safeString } from './factoryPanelText'

export function normalizeDescriptionForCheck(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s/:-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function compactPublicDescription(input: string, maxLength = 520) {
  const normalized = String(input || '').replace(/\s+/g, ' ').trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trim()}...`
}

export function isInternalFactoryDescription(input: string) {
  const normalized = normalizeDescriptionForCheck(input)

  if (!normalized) return true

  return [
    'nu chinh thuoc kieu',
    'truyen phai uu tien drama lane',
    'drama lane',
    'khoa the loai da chon',
    'genre lock',
    'core premise',
    'story seed',
    'factory seed',
    'opening scene bat buoc',
    'inciting incident',
    'evidence object',
    'main conflict',
    'hidden truth',
    'villain type',
    'heroine arc',
    'power structure',
    'short fingerprint',
    'drama balance',
  ].some((marker) => normalized.includes(marker))
}

export function buildCleanFactoryStoryDescription(params: {
  parsedDescription: string
  publicDescription: string
  storySeed?: FactoryStorySeed | null
}) {
  const candidates = [
    params.publicDescription,
    params.parsedDescription,
  ]

  for (const candidate of candidates) {
    const clean = compactPublicDescription(candidate)
    if (clean && clean.length >= 60 && !isInternalFactoryDescription(clean)) {
      return clean
    }
  }

  const storySeed = params.storySeed
  const openingScene = compactPublicDescription(storySeed?.openingScene || 'một biến cố bất ngờ', 120)
  const evidenceObject = compactPublicDescription(storySeed?.evidenceObject || 'một vật chứng bị che giấu', 120)
  const hiddenTruth = compactPublicDescription(storySeed?.hiddenTruth || 'sự thật phía sau những lời nói dối', 180)

  return compactPublicDescription(
    `Một biến cố tại ${openingScene} khiến ${evidenceObject} xuất hiện sai thời điểm, kéo nữ chính vào cuộc đối đầu với những người đang cố che giấu sự thật. Từ một điểm bất thường nhỏ, cô phải bình tĩnh gom chứng cứ, bảo vệ điều quan trọng nhất và từng bước lật lại ${hiddenTruth}.`,
  )
}


export function buildFactoryStorySlug(title: string, suffix: string) {
  const base =
    safeString(title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 70) || 'truyen-ai'

  const cleanSuffix =
    safeString(suffix)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 18) || makeId().slice(0, 6)

  return `${base}-${cleanSuffix}`
}

export function normalizeCategoryText(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function uniqueSlugs(items: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const item of items) {
    const clean = String(item || '').trim()
    if (!clean || seen.has(clean)) continue
    seen.add(clean)
    result.push(clean)
  }

  return result
}

export function getPreferredPublicGenreSlugs(params: {
  genreLabel: string
  genreSlug?: string
  storySeed?: FactoryStorySeed | null
}) {
  const source = normalizeCategoryText([
    params.genreLabel,
    params.storySeed?.genreBlend?.join(' '),
    params.storySeed?.corePremise,
    params.storySeed?.setting,
    params.storySeed?.evidenceObject,
    params.storySeed?.mainConflict,
    params.storySeed?.hiddenTruth,
    params.storySeed?.publicPressure,
  ].filter(Boolean).join(' | '))

  const slugs: string[] = []

  const directGenreSlug = String(params.genreSlug || '').trim()
  if (directGenreSlug) {
    slugs.push(directGenreSlug)
  }

  const add = (...items: string[]) => {
    slugs.push(...items)
  }

  if (source.includes('tai sinh') || source.includes('trong sinh') || source.includes('lam lai cuoc doi')) {
    add('trong-sinh')
  }

  if (source.includes('xuyen khong')) {
    add('xuyen-khong')
  }

  if (
    source.includes('showbiz') ||
    source.includes('hot search') ||
    source.includes('livestream') ||
    source.includes('idol') ||
    source.includes('kol') ||
    source.includes('phim truong') ||
    source.includes('hop bao') ||
    source.includes('truyen thong') ||
    source.includes('pr scandal')
  ) {
    add('showbiz', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('thuong chien') ||
    source.includes('co phan') ||
    source.includes('hoi dong') ||
    source.includes('ngan hang') ||
    source.includes('tai chinh') ||
    source.includes('startup') ||
    source.includes('doanh nghiep') ||
    source.includes('tong tai')
  ) {
    add('thuong-chien', 'nu-cuong', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('hao mon') ||
    source.includes('gia toc') ||
    source.includes('biet thu') ||
    source.includes('me chong') ||
    source.includes('nha chong') ||
    source.includes('di chuc') ||
    source.includes('thua ke') ||
    source.includes('lien hon') ||
    source.includes('thien kim')
  ) {
    add('hao-mon', 'gia-dau', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('hon nhan') ||
    source.includes('ngoai tinh') ||
    source.includes('tieu tam') ||
    source.includes('ly hon') ||
    source.includes('chong cu') ||
    source.includes('dam cuoi') ||
    source.includes('hon le') ||
    source.includes('hon uoc') ||
    source.includes('hon the') ||
    source.includes('cuoi')
  ) {
    add('hon-nhan', 'ngoai-tinh', 'hao-mon', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('me con') ||
    source.includes('quyen nuoi') ||
    source.includes('me don than') ||
    source.includes('bao mau') ||
    source.includes('con nho') ||
    source.includes('dua tre')
  ) {
    add('me-con', 'gia-dinh', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('than the') ||
    source.includes('adn') ||
    source.includes('dna') ||
    source.includes('con ruot') ||
    source.includes('con nuoi') ||
    source.includes('nhan nuoi') ||
    source.includes('song sinh') ||
    source.includes('co nhi vien') ||
    source.includes('trao than phan') ||
    source.includes('nguoi thua ke that lac')
  ) {
    add('bi-mat-than-the', 'than-the', 'hao-mon', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('phap ly') ||
    source.includes('luat su') ||
    source.includes('toa an') ||
    source.includes('don to cao') ||
    source.includes('canh sat') ||
    source.includes('kien') ||
    source.includes('thang kien')
  ) {
    add('phap-ly', 'nu-cuong', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('benh vien') ||
    source.includes('benh an') ||
    source.includes('khoa san') ||
    source.includes('phong kham') ||
    source.includes('xet nghiem') ||
    source.includes('thai san') ||
    source.includes('kham thai')
  ) {
    add('benh-vien', 'bi-mat-than-the', 'me-con', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('khach san') ||
    source.includes('resort') ||
    source.includes('san bay') ||
    source.includes('du thuyen') ||
    source.includes('mat tich') ||
    source.includes('tro ve')
  ) {
    add('tra-thu', 'bi-mat-than-the', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('tra thu') ||
    source.includes('va mat') ||
    source.includes('phan don') ||
    source.includes('lat mat') ||
    source.includes('boc phot') ||
    source.includes('minh oan')
  ) {
    add('tra-thu', 'nu-cuong', 'hien-dai', 'ngon-tinh')
  }

  add('hien-dai', 'ngon-tinh')

  return uniqueSlugs(slugs)
}

export async function resolvePublicGenreSlugs(params: {
  genreLabel: string
  genreSlug?: string
  storySeed?: FactoryStorySeed | null
}) {
  const preferredSlugs = getPreferredPublicGenreSlugs(params)

  const categoryResult = await supabase
    .from('categories')
    .select('slug')

  if (categoryResult.error) {
    return preferredSlugs.slice(0, 2)
  }

  const availableSlugs = (categoryResult.data ?? [])
    .map((item: any) => String(item?.slug || '').trim())
    .filter(Boolean)

  if (!availableSlugs.length) {
    return preferredSlugs.slice(0, 2)
  }

  const availableSet = new Set(availableSlugs)
  const matched = preferredSlugs.filter((slug) => availableSet.has(slug))

  if (matched.length) {
    return matched.slice(0, 2)
  }

  if (availableSet.has('hien-dai')) return ['hien-dai']
  if (availableSet.has('ngon-tinh')) return ['ngon-tinh']

  // Không fallback về category đầu tiên trong database.
  // Nếu fallback availableSlugs[0], truyện không match category sẽ bị dính nhầm
  // category đầu bảng, ví dụ “Hôn nhân phản bội / hủy hôn / chồng cũ hối hận”.
  return preferredSlugs.slice(0, 2)
}

