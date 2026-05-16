export const FACEBOOK_POST_LIMIT = 60000

export type FacebookPostLimitResult = {
  text: string
  charCount: number
  wasTrimmed: boolean
  removedCount: number
}

function normalizeText(input: string) {
  return String(input ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
}

function cutAtNicePoint(text: string, maxLength: number) {
  if (text.length <= maxLength) return text

  const hardCut = text.slice(0, maxLength)

  const paragraphCut = hardCut.lastIndexOf('\n\n')
  if (paragraphCut > Math.floor(maxLength * 0.72)) {
    return hardCut.slice(0, paragraphCut).trim()
  }

  const sentenceMarks = ['. ', '! ', '? ', '。', '！', '？']
  let best = -1

  for (const mark of sentenceMarks) {
    const idx = hardCut.lastIndexOf(mark)
    if (idx > best) best = idx + mark.length
  }

  if (best > Math.floor(maxLength * 0.72)) {
    return hardCut.slice(0, best).trim()
  }

  const spaceCut = hardCut.lastIndexOf(' ')
  if (spaceCut > Math.floor(maxLength * 0.72)) {
    return hardCut.slice(0, spaceCut).trim()
  }

  return hardCut.trim()
}

export function limitFacebookPost(rawText: string, maxLength = FACEBOOK_POST_LIMIT): FacebookPostLimitResult {
  const source = normalizeText(rawText)

  if (source.length <= maxLength) {
    return {
      text: source,
      charCount: source.length,
      wasTrimmed: false,
      removedCount: 0
    }
  }

  const notice = '\n\n...[Bài quá dài nên đã được cắt bớt để đăng Facebook. Đọc tiếp tại link truyện bên dưới.]'
  const available = Math.max(1000, maxLength - notice.length)

  const cut = cutAtNicePoint(source, available)
  const text = `${cut}${notice}`.slice(0, maxLength).trim()

  return {
    text,
    charCount: text.length,
    wasTrimmed: true,
    removedCount: source.length - text.length
  }
}

export function buildSafeFacebookPost(params: {
  title?: string
  chapterLabel?: string
  body: string
  storyUrl?: string
  commentUrl?: string
  imageUrl?: string
  includeLinks?: boolean
  maxLength?: number
}) {
  const {
    title,
    chapterLabel,
    body,
    storyUrl,
    commentUrl,
    imageUrl,
    includeLinks = true,
    maxLength = FACEBOOK_POST_LIMIT
  } = params

  const headerParts = [title, chapterLabel].filter(Boolean)
  const header = headerParts.length > 0 ? `${headerParts.join('\n')}\n\n` : ''

  const footer = includeLinks
    ? [
        '',
        storyUrl ? `Link truyện: ${storyUrl}` : '',
        commentUrl ? `Comment link: Đọc tiếp tại đây nha: ${commentUrl}` : '',
        imageUrl ? `Link ảnh: ${imageUrl}` : ''
      ]
        .filter(Boolean)
        .join('\n')
    : ''

  const reservedFooterLength = footer.length + header.length + 200
  const safeBodyMax = Math.max(1000, maxLength - reservedFooterLength)

  const limitedBody = limitFacebookPost(body, safeBodyMax)

  const full = normalizeText(`${header}${limitedBody.text}${footer}`)
  const finalLimited = limitFacebookPost(full, maxLength)

  return {
    text: finalLimited.text,
    charCount: finalLimited.charCount,
    wasTrimmed: limitedBody.wasTrimmed || finalLimited.wasTrimmed,
    removedCount: limitedBody.removedCount + finalLimited.removedCount
  }
}