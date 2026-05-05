import type { ExistingStory } from '../aiFactoryTypes'

export function base64ToBlob(base64: string, contentType = 'image/png') {
  const byteCharacters = atob(base64)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)

    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    byteArrays.push(new Uint8Array(byteNumbers))
  }

  return new Blob(byteArrays, { type: contentType })
}

export function dataUrlToBlob(dataUrl: string) {
  const [meta, data] = dataUrl.split(',')
  const mimeMatch = meta.match(/data:(.*?);base64/)
  const mimeType = mimeMatch?.[1] || 'image/png'
  return base64ToBlob(data, mimeType)
}

export function buildPublicChapterSummary(readerOnly: string) {
  return readerOnly
    .replace(/^#\s*Chương\s*\d+\s*[—-].*$/gim, '')
    .replace(/#\s*BẢN PHÂN TÍCH KỸ THUẬT[\s\S]*$/i, '')
    .replace(/BẢN PHÂN TÍCH KỸ THUẬT[\s\S]*$/i, '')
    .replace(/===\s*THÔNG TIN TRUYỆN ĐỀ XUẤT\s*===[\s\S]*$/i, '')
    .replace(/===\s*KIỂM TRA TIẾN ĐỘ TRUYỆN\s*===[\s\S]*$/i, '')
    .replace(/===\s*BỘ NHỚ TRUYỆN\s*===[\s\S]*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 350)
}

export function safeJson(value: unknown) {
  try {
    return JSON.stringify(value ?? '')
  } catch {
    return String(value ?? '')
  }
}

function getStoryDnaValue(story: ExistingStory, key: string) {
  const dna = (story as any).story_dna

  if (dna && typeof dna === 'object' && !Array.isArray(dna)) {
    return (dna as Record<string, unknown>)[key]
  }

  if (typeof dna === 'string') {
    try {
      const parsed = JSON.parse(dna) as Record<string, unknown>
      return parsed[key]
    } catch {
      return undefined
    }
  }

  return undefined
}

export function getTargetChapters(story: ExistingStory, fallback: number) {
  const directTarget = Number((story as any).target_chapters)

  if (Number.isFinite(directTarget) && directTarget > 0) {
    return directTarget
  }

  const rawTarget = getStoryDnaValue(story, 'target_chapters')
  const target = Number(rawTarget)

  if (Number.isFinite(target) && target > 0) return target

  return Math.max(1, fallback)
}

export function getStoryGenreLabel(story: ExistingStory) {
  const dnaGenre = getStoryDnaValue(story, 'genre_label')
  if (typeof dnaGenre === 'string' && dnaGenre.trim()) return dnaGenre.trim()

  const genres = (story as any).genres
  if (Array.isArray(genres) && genres.length) return String(genres[0])
  if (typeof genres === 'string' && genres.trim()) return genres.trim()

  return 'Nữ tần đô thị viral'
}

export function getStoryHeroineLabel(story: ExistingStory) {
  const dnaHeroine = getStoryDnaValue(story, 'heroine_style_label')
  if (typeof dnaHeroine === 'string' && dnaHeroine.trim()) return dnaHeroine.trim()

  return 'Nhẫn nhịn rồi phản công'
}
