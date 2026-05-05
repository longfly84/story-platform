import type { FactoryStorySeed, ParsedChapterOutput } from '../aiFactoryTypes'

export function cleanPublicDescriptionText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s.*$/gm, ' ')
    .replace(/\*\*|__/g, '')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function hasFactoryDescriptionLeak(value: string) {
  const text = value.toLowerCase()

  return [
    'nữ chính thuộc kiểu',
    'nu chinh thuoc kieu',
    'truyện phải ưu tiên',
    'truyen phai uu tien',
    'drama lane',
    'factory',
    'story seed',
    'story dna',
    'motif',
    'fingerprint',
    'genre lock',
    'heroine lock',
    'module',
    'prompt',
    'core premise',
    'opening scene',
    'evidence object',
    'villain attack',
    'heroine counter',
    'technical report',
    'bản phân tích kỹ thuật',
    'ban phan tich ky thuat',
    'mở đầu tại',
    'mo dau tai',
    'main arena',
    'public pressure',
  ].some((keyword) => text.includes(keyword))
}

export function shortenPublicDescription(value: string, maxLength = 520) {
  const clean = cleanPublicDescriptionText(value)
  if (clean.length <= maxLength) return clean

  const slice = clean.slice(0, maxLength)
  const sentenceEnd = Math.max(slice.lastIndexOf('.'), slice.lastIndexOf('!'), slice.lastIndexOf('?'))

  if (sentenceEnd >= 180) return slice.slice(0, sentenceEnd + 1).trim()

  return `${slice.replace(/[\s,.;:!?-]+$/g, '')}...`
}

export function extractDescriptionFromReader(readerOnly: string) {
  const withoutChapterTitle = readerOnly
    .replace(/^\s*#\s*Chương\s+\d+\s*[—-].*$/gim, ' ')
    .replace(/^\s*#\s*BẢN ĐỌC CHO ĐỘC GIẢ\s*$/gim, ' ')

  const paragraphs = withoutChapterTitle
    .split(/\n{2,}/)
    .map((item) => cleanPublicDescriptionText(item))
    .filter((item) => item.length >= 50 && !hasFactoryDescriptionLeak(item))

  return shortenPublicDescription(paragraphs.slice(0, 2).join(' '), 520)
}

export function buildSeedBasedPublicDescription(params: {
  storyTitle: string
  genreLabel: string
  heroineLabel: string
  storySeed?: FactoryStorySeed | null
}) {
  const seed = params.storySeed as any
  const evidenceObject = cleanPublicDescriptionText(seed?.evidenceObject || '')
  const openingScene = cleanPublicDescriptionText(seed?.openingScene || '')
  const mainConflict = cleanPublicDescriptionText(seed?.mainConflict || '')
  const hiddenTruth = cleanPublicDescriptionText(seed?.hiddenTruth || '')

  const pieces: string[] = []

  if (openingScene && !hasFactoryDescriptionLeak(openingScene)) {
    pieces.push(`Một biến cố bắt đầu từ ${openingScene.toLowerCase()}`)
  } else {
    pieces.push(`${params.storyTitle} mở ra bằng một biến cố tưởng nhỏ nhưng kéo nữ chính vào vòng xoáy bí mật và quyền lực.`)
  }

  if (evidenceObject && !hasFactoryDescriptionLeak(evidenceObject)) {
    pieces.push(`Khi ${evidenceObject.toLowerCase()} xuất hiện sai thời điểm, cô nhận ra có người đang cố dựng sẵn một cái bẫy.`)
  }

  if (mainConflict && !hasFactoryDescriptionLeak(mainConflict)) {
    pieces.push(`Phía sau mọi chuyện là ${mainConflict.toLowerCase()}.`)
  }

  if (hiddenTruth && !hasFactoryDescriptionLeak(hiddenTruth)) {
    pieces.push(`Nhưng sự thật bị giấu kín còn nguy hiểm hơn những gì cô nhìn thấy ban đầu.`)
  } else {
    pieces.push('Càng lần theo manh mối, cô càng hiểu rằng im lặng mới là điều đối phương mong muốn nhất.')
  }

  return shortenPublicDescription(pieces.join(' '), 520)
}

export function buildFactoryPublicStoryDescription(params: {
  parsed: ParsedChapterOutput
  genreLabel: string
  heroineLabel: string
  storySeed?: FactoryStorySeed | null
}) {
  const parsedDescription = shortenPublicDescription(params.parsed.storyDescription || '', 520)

  if (parsedDescription.length >= 80 && !hasFactoryDescriptionLeak(parsedDescription)) {
    return parsedDescription
  }

  const readerDescription = extractDescriptionFromReader(params.parsed.readerOnly || '')

  if (readerDescription.length >= 120 && !hasFactoryDescriptionLeak(readerDescription)) {
    return readerDescription
  }

  return buildSeedBasedPublicDescription({
    storyTitle: params.parsed.storyTitle,
    genreLabel: params.genreLabel,
    heroineLabel: params.heroineLabel,
    storySeed: params.storySeed,
  })
}
