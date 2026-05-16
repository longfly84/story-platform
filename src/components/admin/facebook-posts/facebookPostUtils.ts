import { resolveCoverUrl } from '@/lib/supabase'

export type GroupPostStatus = 'draft' | 'copied' | 'posted' | 'skipped'

export type GroupPostStory = {
  id: string
  title: string
  slug: string
  description?: string | null
  coverImage?: string | null
  raw: Record<string, any>
}

export type GroupPostChapter = {
  id: string
  storyId: string
  number: number
  title?: string | null
  content: string
  raw: Record<string, any>
}

export type GroupPostDraft = {
  id: string
  storyId: string
  storyTitle: string
  storySlug: string
  chapterId: string
  chapterNumber: number
  chapterTitle?: string | null
  caption: string
  captionNoLink: string
  captionCharCount?: number
  wasTrimmed?: boolean
  removedCharCount?: number
  commentText: string
  storyUrl: string
  imageUrl: string
  status: GroupPostStatus
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'story_platform_group_post_drafts_v1'

export const FACEBOOK_POST_LIMIT = 60000

const GROUP_POST_LENGTH_LIMIT: Record<'short' | 'medium' | 'long', number> = {
  short: 12000,
  medium: 25000,
  long: FACEBOOK_POST_LIMIT,
}

type SafeFacebookPostResult = {
  text: string
  charCount: number
  wasTrimmed: boolean
  removedCharCount: number
}

const FACEBOOK_HOOK_KEYWORDS = [
  'chồng',
  'vợ',
  'bạn thân',
  'mẹ chồng',
  'con',
  'đứa trẻ',
  'ngoại tình',
  'phản bội',
  'bí mật',
  'hồ sơ',
  'camera',
  'clip',
  'ghi âm',
  'cuộc gọi',
  'tin nhắn',
  'tiền',
  'tài khoản',
  'cổ phần',
  'hợp đồng',
  'ly hôn',
  'bệnh viện',
  'khách sạn',
  'sự thật',
  'bằng chứng',
  'tòa',
  'luật sư',
  'mất tích',
  'nhận con nuôi',
  'xét nghiệm',
  'ADN',
  'DNA',
]

function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  if (!url || !anonKey) {
    throw new Error('Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env')
  }

  return {
    url: url.replace(/\/$/, ''),
    anonKey,
  }
}

async function supabaseFetch<T>(path: string): Promise<T> {
  const { url, anonKey } = getSupabaseConfig()

  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Supabase lỗi ${response.status}: ${text || response.statusText}`)
  }

  return response.json() as Promise<T>
}

function safeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function safeId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}


function normalizeFacebookPostText(value: string) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
}

function cutAtReadablePoint(text: string, maxLength: number) {
  if (text.length <= maxLength) return text.trim()

  const hardCut = text.slice(0, maxLength)
  const minGoodCut = Math.floor(maxLength * 0.7)

  const paragraphCut = hardCut.lastIndexOf('\n\n')
  if (paragraphCut >= minGoodCut) return hardCut.slice(0, paragraphCut).trim()

  const sentenceMarks = ['. ', '! ', '? ', '.”', '!”', '?”', '。', '！', '？']
  let sentenceCut = -1

  for (const mark of sentenceMarks) {
    const index = hardCut.lastIndexOf(mark)
    if (index > sentenceCut) sentenceCut = index + mark.length
  }

  if (sentenceCut >= minGoodCut) return hardCut.slice(0, sentenceCut).trim()

  const spaceCut = hardCut.lastIndexOf(' ')
  if (spaceCut >= minGoodCut) return hardCut.slice(0, spaceCut).trim()

  return hardCut.trim()
}

export function limitFacebookPostText(rawText: string, maxLength = FACEBOOK_POST_LIMIT): SafeFacebookPostResult {
  const source = normalizeFacebookPostText(rawText)

  if (source.length <= maxLength) {
    return {
      text: source,
      charCount: source.length,
      wasTrimmed: false,
      removedCharCount: 0,
    }
  }

  const notice = '\n\n...[Bài quá dài nên đã được cắt bớt để đăng Facebook. Đọc tiếp ở link bên dưới.]'
  const available = Math.max(1000, maxLength - notice.length)
  const cut = cutAtReadablePoint(source, available)
  const text = normalizeFacebookPostText(`${cut}${notice}`).slice(0, maxLength).trim()

  return {
    text,
    charCount: text.length,
    wasTrimmed: true,
    removedCharCount: Math.max(0, source.length - text.length),
  }
}

export function ensureSafeFacebookPostText(rawText: string, maxLength = FACEBOOK_POST_LIMIT) {
  return limitFacebookPostText(rawText, maxLength).text
}

function buildSafeCaption(displayBody: string, maxLength: number): SafeFacebookPostResult {
  const closing = '\n\n...\n\n👉 Link đọc tiếp mình để dưới bình luận.'
  const normalizedBody = normalizeFacebookPostText(displayBody)
  const rawCaption = normalizeFacebookPostText(`${normalizedBody}${closing}`)

  if (rawCaption.length <= maxLength) {
    return {
      text: rawCaption,
      charCount: rawCaption.length,
      wasTrimmed: false,
      removedCharCount: 0,
    }
  }

  const notice = '\n\n...[Bài quá dài nên đã được cắt bớt để đăng Facebook.]'
  const availableForBody = Math.max(1000, maxLength - closing.length - notice.length)
  const cutBody = cutAtReadablePoint(normalizedBody, availableForBody)
  const text = normalizeFacebookPostText(`${cutBody}${notice}${closing}`).slice(0, maxLength).trim()

  return {
    text,
    charCount: text.length,
    wasTrimmed: true,
    removedCharCount: Math.max(0, rawCaption.length - text.length),
  }
}

function normalizeDraftForFacebookLimit(draft: GroupPostDraft): GroupPostDraft {
  const safeCaption = limitFacebookPostText(draft.caption || '', FACEBOOK_POST_LIMIT)
  const safeCaptionNoLink = limitFacebookPostText(draft.captionNoLink || draft.caption || '', FACEBOOK_POST_LIMIT)

  return {
    ...draft,
    caption: safeCaption.text,
    captionNoLink: safeCaptionNoLink.text,
    captionCharCount: safeCaption.charCount,
    wasTrimmed: Boolean(draft.wasTrimmed || safeCaption.wasTrimmed || safeCaptionNoLink.wasTrimmed),
    removedCharCount: Math.max(
      Number(draft.removedCharCount || 0),
      safeCaption.removedCharCount,
      safeCaptionNoLink.removedCharCount
    ),
  }
}

function isPublishedStory(row: Record<string, any>) {
  const status = safeText(row.status || row.publish_status || row.state).toLowerCase()

  if (status) {
    return ['published', 'publish', 'public', 'active'].includes(status)
  }

  if (typeof row.is_published === 'boolean') return row.is_published
  if (typeof row.published === 'boolean') return row.published
  if (typeof row.is_active === 'boolean') return row.is_active

  return true
}

function getStoryCover(row: Record<string, any>) {
  const raw =
    row.coverImage ||
    row.cover_image ||
    row.cover_url ||
    row.coverUrl ||
    row.cover ||
    row.image_url ||
    row.thumbnail ||
    null

  if (!raw) return null

  return resolveCoverUrl(String(raw))
}

function normalizeStory(row: Record<string, any>): GroupPostStory | null {
  const id = safeId(row.id)
  const title = safeText(row.title || row.name)
  const slug = safeText(row.slug)
  const coverImage = getStoryCover(row)

  if (!id || !title || !slug || !coverImage) return null

  return {
    id,
    title,
    slug,
    description: safeText(row.description || row.summary || row.excerpt) || null,
    coverImage,
    raw: row,
  }
}

function normalizeChapter(row: Record<string, any>): GroupPostChapter | null {
  const id = safeId(row.id)
  const storyId = safeId(row.story_id || row.storyId)
  const content = safeText(row.content || row.body || row.text)
  const numberRaw = row.number ?? row.chapter_number ?? row.chapterNumber ?? row.order_index ?? row.sort_order ?? 1
  const number = Number(numberRaw) || 1

  if (!id || !storyId || !content) return null

  return {
    id,
    storyId,
    number,
    title: safeText(row.title || row.name) || null,
    content,
    raw: row,
  }
}

export async function loadPublishedStories(): Promise<GroupPostStory[]> {
  const rows = await supabaseFetch<Record<string, any>[]>(
    'stories?select=*&order=created_at.desc.nullslast'
  )

  return rows
    .filter(isPublishedStory)
    .map(normalizeStory)
    .filter((story): story is GroupPostStory => Boolean(story))
}

export async function loadStoryChapters(storyId: string): Promise<GroupPostChapter[]> {
  const encodedStoryId = encodeURIComponent(storyId)

  const rows = await supabaseFetch<Record<string, any>[]>(
    `chapters?select=*&story_id=eq.${encodedStoryId}`
  )

  return rows
    .map(normalizeChapter)
    .filter((chapter): chapter is GroupPostChapter => Boolean(chapter))
    .sort((a, b) => a.number - b.number)
}

export function loadDrafts(): GroupPostDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.map((draft) => normalizeDraftForFacebookLimit(draft as GroupPostDraft))
  } catch {
    return []
  }
}

export function saveDrafts(drafts: GroupPostDraft[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
}

export function upsertDraft(draft: GroupPostDraft) {
  const drafts = loadDrafts()
  const index = drafts.findIndex((item) => item.id === draft.id)

  if (index >= 0) {
    drafts[index] = draft
  } else {
    drafts.unshift(draft)
  }

  saveDrafts(drafts)
  return drafts
}

export function updateDraftStatus(draftId: string, status: GroupPostStatus) {
  const now = new Date().toISOString()

  const drafts = loadDrafts().map((draft) =>
    draft.id === draftId
      ? {
          ...draft,
          status,
          updatedAt: now,
        }
      : draft
  )

  saveDrafts(drafts)
  return drafts
}

export function deleteDraft(draftId: string) {
  const drafts = loadDrafts().filter((draft) => draft.id !== draftId)
  saveDrafts(drafts)
  return drafts
}

function cleanChapterText(content: string) {
  return content
    .replace(/\r/g, '')
    .replace(/^#\s*/gm, '')
    .replace(/^\s*Chương\s+\d+.*$/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function splitParagraphs(content: string) {
  return cleanChapterText(content)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function scoreParagraph(paragraph: string) {
  const lower = paragraph.toLowerCase()
  let score = 0

  if (paragraph.includes('"') || paragraph.includes('“') || paragraph.includes('”')) score += 8
  if (/[0-9]/.test(paragraph)) score += 5
  if (paragraph.includes('?') || paragraph.includes('!')) score += 3
  if (paragraph.length >= 80 && paragraph.length <= 500) score += 3

  for (const keyword of FACEBOOK_HOOK_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) score += 4
  }

  return score
}

function pickBestStartIndex(paragraphs: string[]) {
  if (paragraphs.length <= 2) return 0

  let bestIndex = 0
  let bestScore = -1

  const limit = Math.min(paragraphs.length, 12)

  for (let index = 0; index < limit; index += 1) {
    const score =
      scoreParagraph(paragraphs[index]) +
      scoreParagraph(paragraphs[index + 1] || '') * 0.7 +
      scoreParagraph(paragraphs[index + 2] || '') * 0.4

    if (score > bestScore) {
      bestScore = score
      bestIndex = index
    }
  }

  return bestIndex
}

function getExcerptFromChapters(chapters: GroupPostChapter[], targetLength: number) {
  const paragraphs = chapters.flatMap((chapter) => splitParagraphs(chapter.content))

  if (!paragraphs.length) return ''

  const startIndex = pickBestStartIndex(paragraphs)
  const selected: string[] = []
  let total = 0

  for (let index = startIndex; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index]
    if (!paragraph) continue

    selected.push(paragraph)
    total += paragraph.length

    if (total >= targetLength) break
  }

  return selected.join('\n\n').trim()
}

function buildStoryUrl(storySlug: string) {
  const baseUrl = 'https://truyenngan24h.pro.vn'
  const encodedSlug = encodeURIComponent(storySlug)

  return `${baseUrl}/truyen/${encodedSlug}?utm_source=facebook&utm_medium=group_post&utm_campaign=group_post_factory&utm_content=${encodedSlug}`
}

function buildOpenHook(excerpt: string) {
  const firstLine = excerpt.split('\n').map((line) => line.trim()).find(Boolean) || ''
  const compact = firstLine.replace(/^["“”]+|["“”]+$/g, '').trim()

  if (compact.length >= 20 && compact.length <= 120) {
    return `“${compact}”`
  }

  return `Có những bí mật chỉ cần mở ra một lần, cả cuộc đời sẽ không thể quay lại như cũ.`
}

function buildFullChapterBody(chapters: GroupPostChapter[]) {
  return chapters
    .map((chapter) => {
      const title = chapter.title?.trim()
      const heading = title
        ? `Chương ${chapter.number} — ${title}`
        : `Chương ${chapter.number}`

      const body = cleanChapterText(chapter.content)

      return `${heading}

${body}`
    })
    .join('\n\n---\n\n')
    .trim()
}

function removeDuplicatedHook(openHook: string, body: string) {
  const normalizedHook = openHook.replace(/^["“”]+|["“”]+$/g, '').trim()
  const normalizedBody = body.replace(/^["“”]+|["“”]+$/g, '').trim()

  if (
    normalizedHook.length > 0 &&
    normalizedBody.toLowerCase().startsWith(normalizedHook.toLowerCase())
  ) {
    return body
  }

  return `${openHook}

${body}`
}

function trimExcerptEnd(excerpt: string) {
  const trimmed = excerpt.trim()

  if (trimmed.length <= 1200) return trimmed

  const cut = trimmed.slice(0, 1200)
  const lastBreak = cut.lastIndexOf('\n\n')
  const lastDot = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('?'))

  if (lastBreak > 700) return cut.slice(0, lastBreak).trim()
  if (lastDot > 700) return cut.slice(0, lastDot + 1).trim()

  return `${cut.trim()}...`
}

export function createGroupPostDraft(params: {
  story: GroupPostStory
  chapters: GroupPostChapter[]
  mode: 'chapter1' | 'chapter1_2'
  length: 'short' | 'medium' | 'long'
}): GroupPostDraft {
  const { story, chapters, mode, length } = params

  const selectedChapters =
    mode === 'chapter1_2'
      ? chapters.filter((chapter) => chapter.number <= 2)
      : chapters.filter((chapter) => chapter.number === 1)

  const fallbackChapters = selectedChapters.length ? selectedChapters : chapters.slice(0, 1)

  const fullBody = buildFullChapterBody(fallbackChapters)

  if (fullBody.length < 800) {
    throw new Error('Chương quá ngắn hoặc chưa đủ nội dung để tạo bài Facebook.')
  }

  const hookTargetLength =
    length === 'short'
      ? 300
      : length === 'long'
        ? 700
        : 500

  const hookProbe = trimExcerptEnd(getExcerptFromChapters(fallbackChapters, hookTargetLength))
  const openHook = buildOpenHook(hookProbe)
  const displayBody = removeDuplicatedHook(openHook, fullBody)

  const storyUrl = buildStoryUrl(story.slug)
  const chapter = fallbackChapters[0]

  const safeCaption = buildSafeCaption(displayBody, GROUP_POST_LENGTH_LIMIT[length])
  const caption = safeCaption.text

  const captionNoLink = caption

  const commentText = `Đọc tiếp tại đây nha:
${storyUrl}`

  const now = new Date().toISOString()

  return {
    id: `group-post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    storyId: story.id,
    storyTitle: story.title,
    storySlug: story.slug,
    chapterId: chapter.id,
    chapterNumber: chapter.number,
    chapterTitle: chapter.title,
    caption,
    captionNoLink,
    captionCharCount: safeCaption.charCount,
    wasTrimmed: safeCaption.wasTrimmed,
    removedCharCount: safeCaption.removedCharCount,
    commentText,
    storyUrl,
    imageUrl: story.coverImage || '',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  }
}

export async function copyText(text: string) {
  if (!navigator.clipboard) {
    throw new Error('Trình duyệt không hỗ trợ copy tự động.')
  }

  await navigator.clipboard.writeText(text)
}

export function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export function getStatusLabel(status: GroupPostStatus) {
  if (status === 'draft') return 'Nháp'
  if (status === 'copied') return 'Đã copy'
  if (status === 'posted') return 'Đã đăng'
  return 'Bỏ qua'
}

export function getDeviceOpenTarget(url: string) {
  return url || '#'
}