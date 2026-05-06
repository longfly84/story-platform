import type {
  AIFactoryConfig,
  ExistingStory,
  FactoryJob,
  FactoryLog,
  FactoryStatus,
  FactoryStorySeed,
  ParsedChapterOutput,
} from '../aiFactoryTypes'
import { makeId, parseChapterOutput, sleep, validateChapterOutput } from '../aiFactoryUtils'
import type { ContinueStatusFilter, ExistingChapterRow, IncompleteStory } from '../types/factoryPanelTypes'
import {
  buildPublicChapterSummary,
  getStoryGenreLabel,
  getStoryHeroineLabel,
  getTargetChapters,
  safeJson,
} from './factoryPanelHelpers'
import { getFactoryChapterProgress } from './factoryProgress'

type AddLog = (message: string, type?: FactoryLog['type']) => void

type SupabaseLike = {
  from: (table: string) => any
}

type ScanIncompleteStoriesParams = {
  supabase: SupabaseLike
  config: AIFactoryConfig
  continueStatusFilter: ContinueStatusFilter
  continueChaptersPerStory: number
  setCurrentAction: (value: string) => void
  setIncompleteStories: (stories: IncompleteStory[]) => void
  addLog: AddLog
}

type RecentChapterForGenerate = {
  chapter_number: number
  title: string
  content: string
  summary?: string
}

type GenerateChapterParams = {
  provider: AIFactoryConfig['provider']
  modelKey: AIFactoryConfig['modelKey']
  storyTitle: string
  storyDescription: string
  genreLabel: string
  heroineLabel: string
  chapterNumber: number
  targetChapters: number
  isFinalChapter?: boolean
  recentChapters: RecentChapterForGenerate[]
  storyMemory: string
  factoryPromptIdea: string
  runShortId: string
  storySeed?: FactoryStorySeed | null
  storyDna?: unknown
}

type InsertChapterDraftParams = {
  storyId: string
  parsed: ParsedChapterOutput
  chapterNumber: number
  status: AIFactoryConfig['chapterStatus']
}

type ContinueExistingStoriesParams = {
  supabase: SupabaseLike
  config: AIFactoryConfig
  continueStoryLimit: number
  continueChaptersPerStory: number
  selectedContinueStoryId?: string
  stopRequestedRef: { current: boolean }
  setStatus: (status: FactoryStatus) => void
  setCurrentAction: (value: string) => void
  setLogs: (logs: FactoryLog[] | ((prev: FactoryLog[]) => FactoryLog[])) => void
  setJobs: (jobs: FactoryJob[] | ((prev: FactoryJob[]) => FactoryJob[])) => void
  updateJob: (jobId: string, patch: Partial<FactoryJob>) => void
  addLog: AddLog
  scanIncompleteStories: () => Promise<IncompleteStory[]>
  generateChapter: (params: GenerateChapterParams) => Promise<string>
  insertChapterDraft: (params: InsertChapterDraftParams) => Promise<{ id: string; title: string; chapter_number: number }>
}

function safeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function compactText(value: string, maxLength = 4000) {
  const clean = safeString(value).replace(/\s+/g, ' ')
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength).trim()}...`
}

function serializeUsefulJson(value: unknown, maxLength = 5000) {
  if (!value) return ''

  if (typeof value === 'string') {
    return compactText(value, maxLength)
  }

  try {
    return compactText(JSON.stringify(value, null, 2), maxLength)
  } catch {
    return compactText(String(value), maxLength)
  }
}

function getChapterNumber(chapter: ExistingChapterRow, fallback: number) {
  const chapterNumber = Number(chapter.chapter_number ?? fallback)
  return Number.isFinite(chapterNumber) && chapterNumber > 0
    ? Math.floor(chapterNumber)
    : fallback
}

function normalizeChapters(chapters: ExistingChapterRow[]) {
  return chapters
    .map((chapter, index) => ({
      ...chapter,
      chapter_number: getChapterNumber(chapter, index + 1),
    }))
    .sort((a, b) => Number(a.chapter_number ?? 0) - Number(b.chapter_number ?? 0))
}

function getMaxChapterNumber(chapters: ExistingChapterRow[]) {
  return chapters.reduce((max, chapter, index) => {
    const chapterNumber = getChapterNumber(chapter, index + 1)
    return Math.max(max, chapterNumber)
  }, 0)
}

function uniqueChapters(chapters: ExistingChapterRow[]) {
  const selected = new Map<number, ExistingChapterRow>()

  chapters.forEach((chapter, index) => {
    selected.set(getChapterNumber(chapter, index + 1), chapter)
  })

  return Array.from(selected.values()).sort(
    (a, b) => Number(a.chapter_number ?? 0) - Number(b.chapter_number ?? 0),
  )
}

function selectContextChapters(chapters: ExistingChapterRow[]) {
  const normalized = normalizeChapters(chapters)

  return uniqueChapters([
    ...normalized.slice(0, 3),
    ...normalized.slice(-6),
  ])
}

function buildContinueRecentChapters(chapters: ExistingChapterRow[]) {
  return selectContextChapters(chapters).map((chapter, index) => ({
    chapter_number: getChapterNumber(chapter, index + 1),
    title: chapter.title || `Chương ${chapter.chapter_number ?? index + 1}`,
    content: compactText(chapter.content || '', 6500),
    summary: chapter.summary || buildPublicChapterSummary(chapter.content || ''),
  }))
}

function buildStoryDnaContext(story: ExistingStory) {
  const storyDna = (story as any).story_dna
  if (!storyDna) return ''

  const serialized = serializeUsefulJson(storyDna, 7000)
  if (!serialized || serialized === '{}' || serialized === 'null') return ''

  return `STORY_DNA / OUTLINE ĐANG CÓ:\n${serialized}`
}

function buildRecentChapterContext(chapters: ExistingChapterRow[]) {
  return normalizeChapters(chapters)
    .map((chapter, index) => {
      const chapterNumber = getChapterNumber(chapter, index + 1)
      const summary = chapter.summary || buildPublicChapterSummary(chapter.content || '')
      return `Chương ${chapterNumber} — ${chapter.title || `Chương ${chapterNumber}`}\nTóm tắt: ${compactText(summary, 1000)}`
    })
    .join('\n\n')
}

function buildCurrentStateContext(chapters: ExistingChapterRow[], nextChapterNumber: number) {
  const normalized = normalizeChapters(chapters)
  const latest = normalized.at(-1)
  const latestNumber = latest ? getChapterNumber(latest, normalized.length) : nextChapterNumber - 1
  const latestSummary = latest?.summary || buildPublicChapterSummary(latest?.content || '')

  return `
CURRENT STORY STATE — KHÓA MẠCH HIỆN TẠI:
- Chương gần nhất đã có: Chương ${latestNumber} — ${latest?.title || 'Không rõ'}.
- Tóm tắt chương gần nhất: ${compactText(latestSummary, 1400) || 'Không có dữ liệu.'}
- Chương mới phải bắt đầu SAU hậu quả của chương gần nhất, không được viết lại sự kiện cũ như mới xảy ra.
- Nếu chương gần nhất đã công khai một bằng chứng, chương mới phải cho thấy hậu quả/phản ứng/phản công từ bằng chứng đó.
- Nếu chương gần nhất đã có cảnh họp/đối chất/niêm phong/tạm ngưng, chương mới ưu tiên đổi sang cảnh hành động, cảnh mẹ con, cảnh lấy chứng cứ, cảnh nhân chứng, cảnh theo dõi hoặc cảnh phản công.
`.trim()
}


type ContinueStoryLedger = {
  previousEvents: string[]
  usedEvidence: string[]
  usedScenes: string[]
  usedVillainMoves: string[]
  pendingPromises: string[]
  unresolvedThreads: string[]
  forbiddenRepeats: string[]
  nextChapterObligations: string[]
  usedChapterTitles: string[]
  repeatedStylePhrases: string[]
  supportRoleWarnings: string[]
  latestChapterRole: string
}

function normalizeForLedger(input: string) {
  return safeString(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s:/.%-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function uniqueLedgerItems(items: string[], limit = 12) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const item of items) {
    const clean = compactText(item, 260)
    const key = normalizeForLedger(clean)
    if (!clean || key.length < 8 || seen.has(key)) continue

    seen.add(key)
    result.push(clean)
    if (result.length >= limit) break
  }

  return result
}

function splitLedgerSentences(input: string) {
  return safeString(input)
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 24)
}

function pickLedgerSentences(input: string, patterns: RegExp[], limit = 6) {
  const sentences = splitLedgerSentences(input)
  const matched: string[] = []

  for (const sentence of sentences) {
    const normalized = normalizeForLedger(sentence)
    if (patterns.some((pattern) => pattern.test(normalized))) {
      matched.push(sentence)
    }
    if (matched.length >= limit) break
  }

  return matched
}

function buildChapterLedgerSource(chapter: ExistingChapterRow | RecentChapterForGenerate, fallbackNumber: number) {
  const chapterNumber = getChapterNumber(chapter as ExistingChapterRow, fallbackNumber)
  const title = safeString((chapter as any).title) || `Chương ${chapterNumber}`
  const summary = safeString((chapter as any).summary)
  const content = safeString((chapter as any).content)

  return {
    chapterNumber,
    title,
    summary,
    content,
    text: [title, summary, compactText(content, 1800)].filter(Boolean).join('. '),
  }
}

function extractPendingPromisesFromText(text: string) {
  return pickLedgerSentences(
    text,
    [
      /\bhen\b/,
      /\bgap\b/,
      /\bcho\b.*\b(toi|co|anh|em)\b/,
      /\bgoi lai\b/,
      /\btoi nay\b/,
      /\bsang mai\b/,
      /\bngay mai\b/,
      /\bba gio\b/,
      /\b3 gio\b/,
      /\b9 gio\b/,
      /\bmuoi phut\b/,
      /\btruoc khi\b/,
      /\bneu\b.*\bmuon biet\b/,
      /\btoi se cho\b/,
      /\bden\b.*\b(phong|ham|san bay|benh vien|truong|khach san|van phong|toa|cong ty|nha|biet thu)\b/,
      /\bmo\b.*\b(file|tep|hop|ket|cua|phong|usb|dien thoai)\b/,
      /\bxem\b.*\b(camera|clip|video|ho so|tin nhan|ghi am)\b/,
      /\bcho toi\b.*\b(xem|gap|biet)\b/,
      /\bdung gio\b/,
      /\bhan cuoi\b/,
      /\bdeadline\b/,
    ],
    8,
  )
}


function normalizeTitleForCompare(input: string) {
  return normalizeForLedger(input)
    .replace(/^chuong\s+\d+\s*/i, '')
    .replace(/^(chuong|chapter)\s*/i, '')
    .replace(/^[\s:—\-]+/, '')
    .trim()
}

function getChapterTitleList(sources: Array<{ chapterNumber: number; title: string }>) {
  return uniqueLedgerItems(
    sources
      .map((chapter) => chapter.title)
      .filter(Boolean)
      .map((title) => title.replace(/^#?\s*Chương\s+\d+\s*[—:-]?\s*/i, '').trim()),
    18,
  )
}

function extractRepeatedStylePhrasesFromChapters(sources: Array<{ text: string }>) {
  const normalizedTexts = sources.map((source) => normalizeForLedger(source.text))
  const phraseRules = [
    { label: 'tóc búi lỏng / áo khoác mỏng / không mặc đồng phục', tokens: ['toc bui long', 'ao khoac mong', 'khong mac dong phuc'] },
    { label: 'giọng lạnh như thép / như dao / như kính', tokens: ['giong lanh nhu thep', 'giong lanh nhu dao', 'giong lanh nhu kinh'] },
    { label: 'nụ cười như dao / lưỡi dao / kính', tokens: ['nu cuoi nhu dao', 'luoi dao', 'nhu kinh'] },
    { label: 'ánh đèn lạnh dội lên kính / phòng họp kính', tokens: ['anh den lanh', 'doi len kinh', 'phong hop'] },
    { label: 'tôi không khóc / tôi không la / tôi chỉ giữ bình tĩnh', tokens: ['toi khong khoc', 'toi khong la', 'giu binh tinh'] },
    { label: 'mùi bã cà phê / tiếng piano rạc rạc', tokens: ['mui ba ca phe', 'tieng piano rac rac'] },
    { label: 'tin nhắn vẫn còn in trên màn hình', tokens: ['tin nhan', 'van con in tren man hinh'] },
  ]

  const repeated = phraseRules.filter((rule) => {
    let count = 0

    normalizedTexts.forEach((text) => {
      if (rule.tokens.some((token) => text.includes(token))) count += 1
    })

    return count >= 2
  })

  return uniqueLedgerItems(
    repeated.map((rule) => `Không lặp lại cụm/motif văn phong: ${rule.label}`),
    10,
  )
}

function inferChapterRole(chapter: { title: string; summary?: string; content?: string; text?: string }) {
  const source = normalizeForLedger([chapter.title, chapter.summary, chapter.content, chapter.text].filter(Boolean).join(' '))

  const roleRules: Array<{ role: string; keywords: string[] }> = [
    { role: 'public accusation / công khai tố cáo', keywords: ['gala', 'hop bao', 'livestream', 'cong khai', 'san khau', 'weibo', 'hot search'] },
    { role: 'boardroom confrontation / họp hội đồng', keywords: ['phong hop', 'hoi dong', 'co dong', 'bo phieu', 'tam quyen', 'dinh chi'] },
    { role: 'hospital human stakes / bệnh viện người thân', keywords: ['benh vien', 'thuoc', 'me toi', 'phong benh', 'y ta', 'bac si', 'cap cuu'] },
    { role: 'evidence retrieval / lấy chứng cứ', keywords: ['kho kiem toan', 'lay ban goc', 'log', 'server', 'may in', 'metadata', 'usb', 'cctv', 'camera'] },
    { role: 'bank freeze / ngân hàng phong tỏa', keywords: ['ngan hang', 'phong toa', 'tai khoan', 'the truy cap', 'dong bang'] },
    { role: 'witness pressure / nhân chứng bị ép', keywords: ['nhan chung', 'bi de doa', 'bi ep', 'doi loi khai', 'sa thai', 'dinh chi', 'con toi'] },
    { role: 'private trap / gài bẫy riêng tư', keywords: ['quan tra', 'quan ca phe', 'hen', 'bay', 'thu am', 'gap rieng'] },
    { role: 'final payoff / kết payoff', keywords: ['dieu tra vien', 'lenh bat', 'tam giam', 'khoi to', 'xin loi cong khai', 'boi thuong', 'khoi phuc'] },
  ]

  const matched = roleRules.find((rule) => rule.keywords.some((keyword) => source.includes(normalizeForLedger(keyword))))
  return matched?.role || 'general progression / tiến triển chung'
}

function buildSupportRoleWarnings(sources: Array<{ text: string }>) {
  const names = ['ly diem', 'manh tin', 'tong yen', 'tuong ky', 'trinh vien', 'ha linh y', 'vien hao', 'bach khang']
  const roleActions = [
    'luat su',
    'ky thuat',
    'it',
    'metadata',
    'kiem toan',
    'ngan hang',
    'dieu tra',
    'thu am',
    'sao luu',
    'bao ve',
    'truyen thong',
    'phap vu',
  ]
  const allText = normalizeForLedger(sources.map((source) => source.text).join(' '))

  return uniqueLedgerItems(
    names
      .map((name) => {
        if (!allText.includes(name)) return ''
        const actionCount = roleActions.filter((action) => allText.includes(action)).length
        if (actionCount < 6) return ''
        return `Khóa vai phụ ${name}: không để một nhân vật làm quá nhiều việc. Nếu cần kỹ thuật/kiểm toán/pháp lý, hãy tách qua cộng sự hoặc mô tả rõ vai chính của họ.`
      })
      .filter(Boolean),
    8,
  )
}

function buildContinueStoryLedger(args: {
  chapters: Array<ExistingChapterRow | RecentChapterForGenerate>
  nextChapterNumber: number
}): ContinueStoryLedger {
  const normalized = normalizeChapters(args.chapters as ExistingChapterRow[])
  const sources = normalized.map((chapter, index) => buildChapterLedgerSource(chapter, index + 1))
  const latest = sources.at(-1)
  const usedChapterTitles = getChapterTitleList(sources)
  const repeatedStylePhrases = extractRepeatedStylePhrasesFromChapters(sources)
  const supportRoleWarnings = buildSupportRoleWarnings(sources)
  const latestChapterRole = latest ? inferChapterRole(latest) : 'general progression / tiến triển chung'

  const eventItems = sources
    .slice(-8)
    .map((chapter) => {
      const sourceSummary =
        chapter.summary ||
        splitLedgerSentences(chapter.content).slice(0, 2).join(' ') ||
        chapter.title

      return `Chương ${chapter.chapterNumber} — ${chapter.title}: ${compactText(sourceSummary, 220)}`
    })

  const usedEvidence = sources.flatMap((chapter) =>
    pickLedgerSentences(
      chapter.text,
      [
        /\bho so\b/,
        /\bbien ban\b/,
        /\bcamera\b/,
        /\bcctv\b/,
        /\bclip\b/,
        /\bvideo\b/,
        /\bghi am\b/,
        /\btin nhan\b/,
        /\bcuoc goi\b/,
        /\bemail\b/,
        /\busb\b/,
        /\bthe nho\b/,
        /\bsao ke\b/,
        /\bhop dong\b/,
        /\bdi chuc\b/,
        /\badn\b/,
        /\bdna\b/,
        /\bxet nghiem\b/,
        /\bgiay khai sinh\b/,
        /\bso kham thai\b/,
        /\bve may bay\b/,
        /\bboarding\b/,
        /\bvali\b/,
        /\bthe phong\b/,
        /\bhoa don\b/,
        /\blog\b/,
        /\bnhan chung\b/,
        /\bloi khai\b/,
      ],
      4,
    ),
  )

  const usedScenes = sources.flatMap((chapter) =>
    pickLedgerSentences(
      [chapter.title, chapter.summary, chapter.content].join('. '),
      [
        /\bphong hop\b/,
        /\bdoi chat\b/,
        /\bbenh vien\b/,
        /\btruong\b/,
        /\bphu huynh\b/,
        /\bsan bay\b/,
        /\bkhach san\b/,
        /\bham ruou\b/,
        /\bbiet thu\b/,
        /\bvan phong\b/,
        /\bcong ty\b/,
        /\btoa an\b/,
        /\bvan phong luat\b/,
        /\bphong khach\b/,
        /\bbai do xe\b/,
        /\btang ham\b/,
        /\bdu thuyen\b/,
        /\bdam cuoi\b/,
        /\bhon le\b/,
        /\bhop bao\b/,
        /\blivestream\b/,
      ],
      3,
    ),
  )

  const usedVillainMoves = sources.flatMap((chapter) =>
    pickLedgerSentences(
      chapter.text,
      [
        /\bde doa\b/,
        /\bep\b/,
        /\bdoi\b.*\bky\b/,
        /\bphong toa\b/,
        /\bkhoa\b/,
        /\bniem phong\b/,
        /\btam ngung\b/,
        /\bsa thai\b/,
        /\btung\b.*\bclip\b/,
        /\btung\b.*\btin\b/,
        /\bboc phot\b/,
        /\bhot search\b/,
        /\bcat ghep\b/,
        /\bdoi trang\b/,
        /\bmua chuoc\b/,
        /\bdoi loi khai\b/,
        /\bvu khong\b/,
        /\bdo toi\b/,
      ],
      4,
    ),
  )

  const allPending = sources.flatMap((chapter) => extractPendingPromisesFromText(chapter.text))
  const latestPending = latest ? extractPendingPromisesFromText(latest.text) : []
  const pendingPromises = uniqueLedgerItems([...latestPending, ...allPending.reverse()], 10)

  const unresolvedThreads = uniqueLedgerItems(
    [
      ...pickLedgerSentences(
        sources.map((chapter) => chapter.text).join(' '),
        [
          /\bchua\b.*\bro\b/,
          /\bchua\b.*\bbiet\b/,
          /\bai\b.*\bdung sau\b/,
          /\bai\b.*\bsua\b/,
          /\bai\b.*\bdoi\b/,
          /\bai\b.*\bcat\b/,
          /\bvi sao\b/,
          /\btai sao\b/,
          /\bnguoi nao\b/,
          /\bbi mat\b/,
          /\bthan phan\b/,
          /\bcha ruot\b/,
          /\bme ruot\b/,
          /\bnguoi thua ke\b/,
          /\bnhan chung\b.*\b(im lang|bo tron|doi phe|so)\b/,
        ],
        12,
      ),
      ...(latestPending.length
        ? latestPending.map((item) => `Móc gần nhất chưa được xử lý dứt điểm: ${item}`)
        : []),
    ],
    12,
  )

  const forbiddenRepeats = uniqueLedgerItems(
    [
      ...usedEvidence.map((item) => `Không phát hiện lại như mới: ${item}`),
      ...usedScenes.slice(-6).map((item) => `Không lặp lại cảnh chính nếu không có biến cố mới: ${item}`),
      ...usedVillainMoves.slice(-6).map((item) => `Không dùng lại cùng đòn phản diện: ${item}`),
      ...usedChapterTitles.slice(-8).map((item) => `Không đặt lại tiêu đề chương đã dùng: ${item}`),
      ...repeatedStylePhrases,
      'Không reset nữ chính về trạng thái chưa biết sự thật đã biết ở chương trước.',
      'Không mở một vụ việc mới để né hook còn treo của chương trước.',
      'Không viết lại cùng một cuộc họp/đối chất/hồ sơ/camera như bản remake của chương cũ.',
    ],
    16,
  )

  const strongestPending = pendingPromises[0]
  const nextChapterObligations = uniqueLedgerItems(
    [
      latest
        ? `Mở chương ${args.nextChapterNumber} bằng hậu quả trực tiếp của Chương ${latest.chapterNumber} — ${latest.title}, không recap dài.`
        : `Mở chương ${args.nextChapterNumber} bằng một biến cố tiếp nối mạch hiện tại.`,
      strongestPending
        ? `Trong 800–1200 chữ đầu phải xử lý hoặc bị chặn có lý do với open loop này: ${strongestPending}`
        : 'Trong 800–1200 chữ đầu phải xử lý hậu quả trực tiếp từ hook/chứng cứ/chuyển biến cuối chương trước.',
      'Nếu một cuộc hẹn/cuộc gọi/deadline bị cắt ngang, phải nói rõ ai chặn, vì sao chặn, và việc đó làm tình thế xấu đi thế nào.',
      'Chương mới phải tạo ít nhất 1 state change thật: nhân chứng đổi phe, phản diện ra đòn mới, bằng chứng cũ đảo nghĩa, quyền lực đổi trạng thái, hoặc nữ chính chủ động gài bẫy.',
      latest ? `Vai trò chương trước là: ${latestChapterRole}. Chương mới không được có cùng vai trò nếu không tạo biến cố/hậu quả khác hẳn.` : '',
      'Tiêu đề chương mới phải khác tất cả tiêu đề đã dùng và phải phản ánh biến cố mới, không chỉ lặp lại tên vật chứng cũ.',
      'Cuối chương phải để lại hook mới phát sinh từ hành động trong chương này, không dùng lại hook cũ.',
    ],
    8,
  )

  return {
    previousEvents: uniqueLedgerItems(eventItems, 10),
    usedEvidence: uniqueLedgerItems(usedEvidence, 12),
    usedScenes: uniqueLedgerItems(usedScenes, 10),
    usedVillainMoves: uniqueLedgerItems(usedVillainMoves, 10),
    pendingPromises,
    unresolvedThreads,
    forbiddenRepeats,
    nextChapterObligations,
    usedChapterTitles,
    repeatedStylePhrases,
    supportRoleWarnings,
    latestChapterRole,
  }
}

function formatLedgerSection(title: string, items: string[]) {
  if (!items.length) return `### ${title}\n- Không phát hiện rõ từ dữ liệu cũ.`
  return `### ${title}\n${items.map((item) => `- ${item}`).join('\n')}`
}

function buildContinueLedgerPromptBlock(ledger: ContinueStoryLedger) {
  return `
CONTINUE STORY LEDGER — CHỐNG LẶP + GIỮ MÓC TREO:

${formatLedgerSection('1. SỰ KIỆN ĐÃ XẢY RA', ledger.previousEvents)}

${formatLedgerSection('2. VẬT CHỨNG / MANH MỐI ĐÃ DÙNG', ledger.usedEvidence)}

${formatLedgerSection('3. CẢNH / ĐỊA ĐIỂM ĐÃ DÙNG', ledger.usedScenes)}

${formatLedgerSection('4. ĐÒN PHẢN DIỆN ĐÃ DÙNG', ledger.usedVillainMoves)}

${formatLedgerSection('5. OPEN LOOP / PENDING PROMISE CHƯA ĐƯỢC XỬ LÝ', ledger.pendingPromises)}

${formatLedgerSection('6. TUYẾN CHƯA GIẢI QUYẾT', ledger.unresolvedThreads)}

${formatLedgerSection('7. CẤM LẶP', ledger.forbiddenRepeats)}

${formatLedgerSection('8. NGHĨA VỤ CHƯƠNG TIẾP THEO', ledger.nextChapterObligations)}

${formatLedgerSection('9. TIÊU ĐỀ CHƯƠNG ĐÃ DÙNG — CẤM TRÙNG', ledger.usedChapterTitles)}

${formatLedgerSection('10. CỤM VĂN PHONG / MÔ TẢ ĐANG BỊ LẶP — PHẢI ĐỔI CÁCH VIẾT', ledger.repeatedStylePhrases)}

${formatLedgerSection('11. CẢNH BÁO VAI PHỤ ÔM QUÁ NHIỀU VIỆC', ledger.supportRoleWarnings)}

### 12. VAI TRÒ CHƯƠNG GẦN NHẤT
- ${ledger.latestChapterRole || 'Không rõ'}

LUẬT BẮT BUỘC:
- Chương mới không được lơ open loop gần nhất.
- Nếu chương trước có cuộc hẹn, lời hứa, deadline, cuộc gọi chưa xử lý, bằng chứng vừa phát hiện, hoặc câu cuối kiểu “đến nơi X / gặp người Y / mở file Z”, chương mới phải xử lý trực tiếp trong 800–1200 chữ đầu.
- Có thể cho open loop bị cắt ngang, nhưng phải cắt ngang bằng một đòn phản diện/hậu quả hợp lý, không được bỏ qua.
- Không phát hiện lại vật chứng đã phát hiện như lần đầu.
- Không để nữ chính bất ngờ vì sự thật cô đã biết.
- Không dùng lại cùng cảnh đối chất/họp/phòng pháp lý nếu không có biến cố mới.
- Không reset conflict về trạng thái cũ.
- Mỗi chương mới phải tiến lên một nấc, không viết remake của chương trước.
- Không được đặt tiêu đề trùng hoặc gần trùng các chương đã có.
- Không được lặp cụm mô tả ngoại hình/không khí/cử chỉ đã dùng nhiều lần; phải đổi cách diễn đạt hoặc chuyển sang hành động cụ thể.
- Không để một nhân vật phụ làm tất cả việc luật sư + kỹ thuật + kiểm toán + truyền thông + cứu nguy. Mỗi nhân vật phụ chỉ giữ 1 vai chính.
`.trim()
}

function extractLedgerKeywordTokens(items: string[]) {
  const stopwords = new Set([
    'chuong',
    'khong',
    'duoc',
    'trong',
    'nhung',
    'nguoi',
    'chinh',
    'phan',
    'dien',
    'truyen',
    'minh',
    'mot',
    'nay',
    'that',
    'bang',
    'chung',
    'dieu',
    'phan',
    'hoi',
    'thay',
    'xuat',
    'hien',
  ])

  return Array.from(
    new Set(
      items
        .join(' ')
        .split(/\s+/)
        .map((item) => normalizeForLedger(item))
        .filter((item) => item.length >= 5 && !stopwords.has(item)),
    ),
  ).slice(0, 24)
}

function hasTokenOverlap(text: string, items: string[], minOverlap = 2) {
  const normalized = normalizeForLedger(text)
  const tokens = extractLedgerKeywordTokens(items)
  if (!tokens.length) return true

  let overlap = 0
  for (const token of tokens) {
    if (normalized.includes(token)) overlap += 1
    if (overlap >= minOverlap) return true
  }

  return false
}

function validateContinueOutputAgainstLedger(args: {
  readerOnly: string
  chapterTitle?: string
  ledger: ContinueStoryLedger
  attempt: number
}) {
  const warnings: string[] = []
  const reader = normalizeForLedger(args.readerOnly)
  const firstPart = normalizeForLedger(args.readerOnly.slice(0, 1800))
  const chapterTitle = normalizeTitleForCompare(args.chapterTitle || '')

  if (chapterTitle) {
    const titleRepeated = args.ledger.usedChapterTitles.some((title) => {
      const oldTitle = normalizeTitleForCompare(title)
      return oldTitle && (chapterTitle === oldTitle || chapterTitle.includes(oldTitle) || oldTitle.includes(chapterTitle))
    })

    if (titleRepeated) {
      warnings.push('Tiêu đề chương mới bị trùng hoặc quá gần tiêu đề chương đã có.')
    }
  }

  const repeatedStyleHits = args.ledger.repeatedStylePhrases.filter((item) => {
    const normalized = normalizeForLedger(item)
    if (normalized.includes('toc bui long') && (reader.includes('toc bui long') || reader.includes('ao khoac mong'))) return true
    if (normalized.includes('giong lanh') && reader.includes('giong lanh')) return true
    if (normalized.includes('nu cuoi') && reader.includes('nu cuoi') && reader.includes('dao')) return true
    if (normalized.includes('anh den lanh') && reader.includes('anh den lanh')) return true
    if (normalized.includes('mui ba ca phe') && reader.includes('mui ba ca phe')) return true
    return false
  })

  if (repeatedStyleHits.length) {
    warnings.push(`Bản mới còn lặp cụm văn phong/mô tả đã bị cảnh báo: ${repeatedStyleHits.slice(0, 2).join(' | ')}`)
  }

  if (args.ledger.pendingPromises.length && !hasTokenOverlap(firstPart, args.ledger.pendingPromises, 2)) {
    warnings.push('Chưa nối open loop/pending promise quan trọng trong 800–1200 chữ đầu.')
  }

  const repeatedEvidenceCount = extractLedgerKeywordTokens(args.ledger.usedEvidence).filter((token) =>
    reader.includes(token),
  ).length

  const hasNewStateChange =
    /\b(nhan chung|doi phe|lo so ho|phan cong|doi chieu|mat quyen|lay lai|xac thuc|mo khoa|doi loi khai|lo bang chung|bi chan|bi ep|bi goi|bi trieu tap|cong khai|hot search|hoi dong|toa|luat su|benh vien|camera|sao ke|tin nhan|ghi am)\b/.test(reader)

  if (repeatedEvidenceCount >= 8 && !hasNewStateChange) {
    warnings.push('Bản mới nhắc lại quá nhiều vật chứng cũ nhưng chưa thấy state change mới.')
  }

  const forbiddenSceneTokens = extractLedgerKeywordTokens(args.ledger.usedScenes.slice(-4))
  const sceneRepeatCount = forbiddenSceneTokens.filter((token) => reader.includes(token)).length

  if (sceneRepeatCount >= 8 && !hasNewStateChange) {
    warnings.push('Bản mới có dấu hiệu lặp cảnh cũ mà chưa tạo biến cố mới.')
  }

  const currentRole = inferChapterRole({
    title: args.chapterTitle || '',
    content: args.readerOnly,
  })

  if (
    args.ledger.latestChapterRole &&
    currentRole === args.ledger.latestChapterRole &&
    currentRole !== 'general progression / tiến triển chung' &&
    !hasNewStateChange
  ) {
    warnings.push(`Chương mới có cùng vai trò với chương trước (${currentRole}) nhưng chưa tạo state change đủ rõ.`)
  }

  return warnings
}


function buildContinueModeInstruction(params: {
  storyTitle: string
  nextChapterNumber: number
  targetChapters: number
  recentChapterTitles: string[]
}) {
  const recentTitles = params.recentChapterTitles.filter(Boolean).join(' / ')

  return `
CONTINUE EXISTING STORY MODE — LUẬT BẮT BUỘC:

Đây là truyện đang viết dở: "${params.storyTitle}".
Đang viết tiếp chương ${params.nextChapterNumber}/${params.targetChapters}.

KHÓA LIÊN TỤC:
- Không được mở một truyện mới.
- Không được đổi tên truyện.
- Không được đổi tên nữ chính, con, phản diện, trường học, vật chứng trung tâm.
- Không được viết lại tình huống đã xảy ra ở các chương trước.
- Không được reset về trạng thái "bắt đầu bị vu oan" nếu truyện đã có bằng chứng mới.

CÁC CHƯƠNG GẦN ĐÂY ĐÃ CÓ:
${recentTitles || 'Không có tiêu đề chương gần đây.'}

UNIQUE CHAPTER ROLE & TITLE LOCK:
- Tiêu đề chương mới không được trùng hoặc gần trùng với bất kỳ tiêu đề chương gần đây.
- Nếu chương trước là họp/đối chất/hội đồng, chương mới không được lại là một cảnh họp tương tự trừ khi có biến cố mới làm đảo chiều quyền lực.
- Nếu chương trước dùng một vật chứng làm trọng tâm, chương mới phải dùng vật chứng đó để mở hậu quả mới, không được trình bày lại nó như phát hiện mới.
- Không lặp mô tả ngoại hình/câu mở đầu/cảm giác không khí đã dùng nhiều lần.

LUẬT TIẾN TRIỂN MỖI CHƯƠNG:
- Mỗi chương mới phải tạo ra ít nhất 1 STATE CHANGE thật:
  1. Có bằng chứng mới được lấy ra; hoặc
  2. Một nhân chứng đổi phe; hoặc
  3. Phản diện phản công bằng đòn mới; hoặc
  4. Nữ chính dùng bằng chứng cũ để mở khóa bằng chứng mới; hoặc
  5. Quyền lực của phản diện bị mất một phần; hoặc
  6. Đứa trẻ / quyền giám hộ / dư luận thay đổi trạng thái rõ ràng.

CẤM LÙI MẠCH:
- Nếu chương trước đã có HR-03 / admin_hanhchinh / thẻ SD / clip 07:12 / Order: Ôn / bằng chứng tương đương, chương sau phải dùng nó để tiến tới hậu quả mới.
- Không được chỉ đem cùng bằng chứng đó ra tranh luận lại.
- Không được lặp lại cảnh "phòng họp phụ huynh" quá nhiều lần.
- Không được dùng lại cùng một dạng cảnh: họp, niêm phong, tạm ngưng, điều tra nội bộ nếu chương trước vừa dùng.

ĐA DẠNG CẢNH:
Ưu tiên luân phiên:
- cảnh mẹ con riêng tư,
- cảnh lấy chứng cứ,
- cảnh nhân chứng bị ép,
- cảnh phản diện phản công,
- cảnh công khai dư luận,
- cảnh pháp lý / hội đồng,
- cảnh payoff.

CẢM XÚC MẸ CON:
Mỗi 1–2 chương phải có một khoảnh khắc cụ thể cho thấy đứa trẻ/người yếu thế bị ảnh hưởng:
- con hỏi mình có sai không,
- con bị bạn xa lánh,
- con không dám ôm vật chứng/đồ chơi,
- con sợ mẹ biến mất,
- nữ chính phải trấn an con bằng hành động cụ thể.

NẾU LÀ CHƯƠNG CUỐI HOẶC GẦN CUỐI:
- Phải payoff các vật chứng đã cài.
- Phải để phản diện mất quyền lực rõ ràng.
- Không được kết bằng cliffhanger giả.
`.trim()
}

function buildContinueMemoryContext(args: {
  baseMemory: string
  story: ExistingStory
  chapters: ExistingChapterRow[]
  nextChapterNumber: number
  targetChapters: number
}) {
  const { baseMemory, story, chapters, nextChapterNumber, targetChapters } = args
  const contextChapters = selectContextChapters(chapters)
  const storyDnaContext = buildStoryDnaContext(story)
  const title = safeString((story as any).title) || 'Truyện chưa có tên'
  const description = compactText(safeString((story as any).description), 1800)
  const chapterContext = buildRecentChapterContext(contextChapters)
  const currentStateContext = buildCurrentStateContext(chapters, nextChapterNumber)
  const continueLedger = buildContinueStoryLedger({
    chapters,
    nextChapterNumber,
  })
  const continueLedgerContext = buildContinueLedgerPromptBlock(continueLedger)
  const continueInstruction = buildContinueModeInstruction({
    storyTitle: title,
    nextChapterNumber,
    targetChapters,
    recentChapterTitles: contextChapters.map((chapter) => chapter.title || ''),
  })

  return [
    continueInstruction,
    continueLedgerContext,
    currentStateContext,
    `Tên truyện gốc: ${title}`,
    description ? `Mô tả public gốc: ${description}` : '',
    storyDnaContext,
    baseMemory ? `STORY_MEMORY ĐANG CÓ:\n${compactText(baseMemory, 7000)}` : '',
    chapterContext ? `CÁC CHƯƠNG MỐC ĐỂ GIỮ MẠCH:\n${chapterContext}` : '',
  ]
    .filter(Boolean)
    .join('\n\n---\n\n')
}

function makeContinuePromptIdea(args: {
  storyTitle: string
  nextChapterNumber: number
  targetChapters: number
  isFinalChapter: boolean
  recentChapterTitles: string[]
  ledger?: ContinueStoryLedger
}) {
  const { storyTitle, nextChapterNumber, targetChapters, isFinalChapter, recentChapterTitles, ledger } = args
  const strongestPending = ledger?.pendingPromises?.[0]
  const obligation = ledger?.nextChapterObligations?.[0]
  const forbiddenRepeats = ledger?.forbiddenRepeats?.slice(0, 5).join(' | ')
  const usedTitles = ledger?.usedChapterTitles?.slice(-8).join(' / ')
  const repeatedStylePhrases = ledger?.repeatedStylePhrases?.slice(0, 4).join(' | ')
  const supportWarnings = ledger?.supportRoleWarnings?.slice(0, 3).join(' | ')
  const latestRole = ledger?.latestChapterRole

  return [
    `Viết tiếp truyện "${storyTitle}" ở chương ${nextChapterNumber}/${targetChapters}.`,
    `Các chương mốc đã có: ${recentChapterTitles.filter(Boolean).join(' / ') || 'không rõ'}.`,
    `Không mở truyện mới, không đổi tên truyện, không đổi premise, không viết lại chương cũ.`,
    `Chương phải nối trực tiếp từ chương trước, có cảnh mới, đối thoại mới, hành động mới và ít nhất một bước tiến thật của vật chứng/xung đột.`,
    strongestPending
      ? `OPEN LOOP BẮT BUỘC PHẢI NỐI TRONG 800–1200 CHỮ ĐẦU: ${strongestPending}`
      : `Nếu chương trước có hook/cuộc hẹn/deadline/bằng chứng vừa mở, phải nối trực tiếp trong 800–1200 chữ đầu.`,
    obligation ? `Nghĩa vụ chương này: ${obligation}` : '',
    forbiddenRepeats ? `Cấm lặp trong chương này: ${forbiddenRepeats}` : '',
    usedTitles ? `Cấm đặt lại các tiêu đề đã dùng/gần dùng: ${usedTitles}. Tiêu đề chương mới phải là biến cố mới.` : '',
    latestRole ? `Vai trò chương trước: ${latestRole}. Chương mới phải đổi vai trò hoặc tạo đảo chiều rõ, không remake.` : '',
    repeatedStylePhrases ? `Cấm lặp văn phong/mô tả đang bị dùng nhiều: ${repeatedStylePhrases}.` : '',
    supportWarnings ? `Khóa vai phụ: ${supportWarnings}` : '',
    `Nếu một cuộc hẹn hoặc móc chương trước bị cắt ngang, phải cho thấy ai/cái gì chặn nó và hậu quả mới tạo ra; không được lơ.`,
    `Nếu chương trước đã là phòng họp/đối chất/niêm phong/tạm ngưng, chương này phải ưu tiên một loại cảnh khác hoặc tạo hậu quả mới rõ ràng.`,
    isFinalChapter
      ? `Đây là chương cuối: phải trả payoff chính, kết thúc mâu thuẫn trung tâm rõ ràng, không cliffhanger giả.`
      : `Đây chưa phải chương cuối: phải đẩy xung đột lên một nấc và để lại hook cụ thể cho chương sau.`,
  ].filter(Boolean).join('\n')
}

export async function scanIncompleteStoriesForFactory(params: ScanIncompleteStoriesParams) {
  const {
    supabase,
    config,
    continueStatusFilter,
    continueChaptersPerStory,
    setCurrentAction,
    setIncompleteStories,
    addLog,
  } = params

  setCurrentAction('Đang quét truyện dang dở...')
  addLog('Quét truyện chưa đủ số chương mục tiêu...')

  let query = supabase
    .from('stories')
    .select(
      'id, title, slug, description, status, completion_status, target_chapters, genres, story_dna, story_memory, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (continueStatusFilter !== 'all') {
    query = query.eq('status', continueStatusFilter)
  }

  const storiesResult = await query

  if (storiesResult.error) {
    addLog(`Không quét được truyện dang dở: ${storiesResult.error.message}`, 'error')
    setCurrentAction('Quét truyện dang dở thất bại')
    setIncompleteStories([])
    return [] as IncompleteStory[]
  }

  const storyRows = (storiesResult.data ?? []) as ExistingStory[]
  const incomplete: IncompleteStory[] = []

  for (const story of storyRows) {
    const storyId = (story as any).id
    if (!storyId) continue

    const chaptersResult = await supabase
      .from('chapters')
      .select('id, story_id, title, slug, content, summary, chapter_number, created_at')
      .eq('story_id', storyId)
      .order('chapter_number', { ascending: true })

    if (chaptersResult.error) {
      addLog(`Không đọc được chapters của ${story.title}: ${chaptersResult.error.message}`, 'warning')
      continue
    }

    const chapters = normalizeChapters((chaptersResult.data ?? []) as ExistingChapterRow[])
    const targetChapters = getTargetChapters(story, config.maxTargetChapters)
    const maxChapterNumber = getMaxChapterNumber(chapters)
    const currentChapters = Math.min(targetChapters, Math.max(chapters.length, maxChapterNumber))
    const missingChapters = Math.max(0, targetChapters - currentChapters)

    if (missingChapters > 0) {
      incomplete.push({
        ...(story as any),
        targetChapters,
        currentChapters,
        missingChapters,
        nextChapterNumber: currentChapters + 1,
        chapters,
      })
    }
  }

  setIncompleteStories(incomplete)
  setCurrentAction(`Đã quét ${incomplete.length} truyện dang dở`)
  addLog(`Tìm thấy ${incomplete.length} truyện chưa hoàn thành.`, incomplete.length ? 'success' : 'warning')

  incomplete.slice(0, 10).forEach((story) => {
    const progress = getFactoryChapterProgress({
      currentChapters: story.currentChapters,
      targetChapters: story.targetChapters,
      maxCreateNow: continueChaptersPerStory,
    })

    addLog(
      `${story.title || 'Truyện chưa có tên'}: ${progress.progressLabel} chương, ${progress.remainingLabel}. ${progress.createRangeLabel}.`,
      progress.isFull ? 'info' : 'success',
    )
  })

  return incomplete
}

export async function continueExistingStoriesForFactory(params: ContinueExistingStoriesParams) {
  const {
    supabase,
    config,
    continueStoryLimit,
    continueChaptersPerStory,
    selectedContinueStoryId = 'auto',
    stopRequestedRef,
    setStatus,
    setCurrentAction,
    setLogs,
    setJobs,
    updateJob,
    addLog,
    scanIncompleteStories,
    generateChapter,
    insertChapterDraft,
  } = params

  stopRequestedRef.current = false
  setStatus('running')
  setCurrentAction('Chuẩn bị viết tiếp truyện dang dở')
  setLogs([])

  addLog(
    selectedContinueStoryId === 'auto'
      ? `Factory sẽ viết tiếp tối đa ${continueStoryLimit} truyện, mỗi truyện thêm tối đa ${continueChaptersPerStory} chương.`
      : `Factory sẽ viết tiếp truyện đã chọn, thêm tối đa ${continueChaptersPerStory} chương.`,
    'info',
  )

  try {
    const scannedStories = await scanIncompleteStories()
    const candidates =
      selectedContinueStoryId === 'auto'
        ? scannedStories.slice(0, Math.max(1, continueStoryLimit))
        : scannedStories.filter((story) => String((story as any).id) === selectedContinueStoryId)

    if (!candidates.length) {
      setStatus('success')
      setCurrentAction('Không có truyện dang dở cần viết tiếp')
      addLog(
        selectedContinueStoryId === 'auto'
          ? 'Không có truyện nào thiếu chương theo target.'
          : 'Truyện đã chọn không còn thiếu chương hoặc không tìm thấy trong danh sách scan.',
        'warning',
      )
      setJobs([])
      return
    }

    const initialJobs: FactoryJob[] = candidates.map((story, index) => ({
      id: makeId('job'),
      index: index + 1,
      title: story.title || 'Truyện chưa có tên',
      genreLabel: getStoryGenreLabel(story),
      genreSlug: Array.isArray((story as any).genres)
        ? String((story as any).genres[0] ?? '')
        : String((story as any).genres ?? ''),
      heroineLabel: getStoryHeroineLabel(story),
      status: 'pending',
      storyId: String((story as any).id),
      storySlug: String((story as any).slug || ''),
      chapterProgress: `${story.currentChapters}/${story.targetChapters}`,
      coverStatus: 'off',
      targetChapters: story.targetChapters,
      createdChapters: story.currentChapters,
      completionStatus: 'ongoing',
    }))

    setJobs(initialJobs)

    for (let storyIndex = 0; storyIndex < candidates.length; storyIndex += 1) {
      if (stopRequestedRef.current) {
        addLog('Đã nhận lệnh stop. Dừng trước truyện tiếp theo.', 'warning')
        break
      }

      const story = candidates[storyIndex]
      const job = initialJobs[storyIndex]
      const storyId = String((story as any).id)
      const storyTitle = story.title || 'Truyện chưa có tên'
      const genreLabel = getStoryGenreLabel(story)
      const heroineLabel = getStoryHeroineLabel(story)
      const chaptersToCreate = Math.min(
        Math.max(1, continueChaptersPerStory),
        story.missingChapters,
      )
      const continueProgress = getFactoryChapterProgress({
        currentChapters: story.currentChapters,
        targetChapters: story.targetChapters,
        maxCreateNow: chaptersToCreate,
      })
      let storyMemory =
        typeof (story as any).story_memory === 'string'
          ? (story as any).story_memory
          : safeJson((story as any).story_memory)
      let nextChapterNumber = story.nextChapterNumber
      const recentChapters = buildContinueRecentChapters(story.chapters)

      storyMemory = buildContinueMemoryContext({
        baseMemory: storyMemory,
        story,
        chapters: story.chapters,
        nextChapterNumber,
        targetChapters: story.targetChapters,
      })

      updateJob(job.id, {
        status: 'running',
        chapterProgress: `${story.currentChapters}/${story.targetChapters}`,
      })

      addLog(
        `Viết tiếp ${storyTitle}: ${continueProgress.progressLabel}, ${continueProgress.remainingLabel}. ${continueProgress.createRangeLabel}.`,
        'info',
      )

      try {
        for (let offset = 0; offset < chaptersToCreate; offset += 1) {
          if (stopRequestedRef.current) {
            updateJob(job.id, {
              status: 'stopped',
              chapterProgress: `${story.currentChapters + offset}/${story.targetChapters}`,
            })
            addLog(`Dừng sau request hiện tại tại truyện ${storyTitle}.`, 'warning')
            break
          }

          const isFinalChapter = nextChapterNumber >= story.targetChapters

          setCurrentAction(`${storyTitle}: generate chương ${nextChapterNumber}`)
          addLog(
            `${storyTitle}: generate chương ${nextChapterNumber}${isFinalChapter ? ' — chương cuối' : ''}...`,
          )

          let output = ''
          let parsed: ParsedChapterOutput | null = null
          let validationErrors: string[] = []
          const continueLedger = buildContinueStoryLedger({
            chapters: recentChapters as unknown as ExistingChapterRow[],
            nextChapterNumber,
          })

          if (continueLedger.pendingPromises.length) {
            addLog(
              `Open loop cần nối: ${compactText(continueLedger.pendingPromises[0], 180)}`,
              'info',
            )
          }

          for (let attempt = 1; attempt <= 2; attempt += 1) {
            const attemptStoryMemory =
              attempt === 1
                ? storyMemory
                : [
                    storyMemory,
                    'REGENERATE CONTINUITY WARNING: Bản trước có dấu hiệu lặp hoặc lơ open loop. Viết lại chương mới với TIÊU ĐỀ KHÁC, vai trò chương khác, mở bằng hậu quả trực tiếp của chương trước, xử lý pending promise trong 800–1200 chữ đầu, tạo state change mới, không lặp vật chứng/cảnh cũ/cụm mô tả cũ.',
                    buildContinueLedgerPromptBlock(continueLedger),
                  ].join('\n\n---\n\n')

            output = await generateChapter({
              provider: config.provider,
              modelKey: config.modelKey,
              storyTitle,
              storyDescription: (story as any).description || '',
              genreLabel,
              heroineLabel,
              chapterNumber: nextChapterNumber,
              targetChapters: story.targetChapters,
              isFinalChapter,
              recentChapters,
              storyMemory: attemptStoryMemory,
              factoryPromptIdea: makeContinuePromptIdea({
                storyTitle,
                nextChapterNumber,
                targetChapters: story.targetChapters,
                isFinalChapter,
                recentChapterTitles: recentChapters.map((chapter) => chapter.title || ''),
                ledger: continueLedger,
              }),
              runShortId: `${storyId}-${nextChapterNumber}`,
              storySeed: (story as any).story_dna || null,
              storyDna: (story as any).story_dna || null,
            })

            parsed = parseChapterOutput({
              output,
              genreLabel,
              chapterNumber: nextChapterNumber,
              runShortId: `${storyId}-${nextChapterNumber}`,
            })

            const validation = validateChapterOutput({
              output,
              readerOnly: parsed.readerOnly,
              chapterNumber: nextChapterNumber,
              storyTitle,
            })

            const continuityWarnings = validation.ok && parsed
              ? validateContinueOutputAgainstLedger({
                  readerOnly: parsed.readerOnly,
                  chapterTitle: parsed.chapterTitle,
                  ledger: continueLedger,
                  attempt,
                })
              : []

            if (validation.ok && !continuityWarnings.length) {
              validationErrors = []
              break
            }

            validationErrors = [
              ...validation.errors,
              ...continuityWarnings,
            ].filter(Boolean)

            addLog(`Validate/continuity fail lần ${attempt}: ${validationErrors.join(' | ')}`, 'warning')
          }

          if (!parsed || validationErrors.length) {
            throw new Error(`Output không đạt validation: ${validationErrors.join(' | ')}`)
          }

          await insertChapterDraft({
            storyId,
            parsed,
            chapterNumber: nextChapterNumber,
            status: config.chapterStatus,
          })

          recentChapters.push({
            chapter_number: nextChapterNumber,
            title: parsed.chapterTitle,
            content: compactText(parsed.readerOnly, 6500),
            summary: buildPublicChapterSummary(parsed.readerOnly),
          })

          while (recentChapters.length > 9) recentChapters.shift()

          storyMemory = buildContinueMemoryContext({
            baseMemory: [storyMemory, parsed.technicalReport].filter(Boolean).join('\n\n---\n\n'),
            story: {
              ...(story as any),
              story_memory: storyMemory,
            } as ExistingStory,
            chapters: recentChapters as unknown as ExistingChapterRow[],
            nextChapterNumber: nextChapterNumber + 1,
            targetChapters: story.targetChapters,
          })

          await supabase
            .from('stories')
            .update({
              story_memory: storyMemory,
              current_arc: `Factory continue — chapter ${nextChapterNumber} generated`,
            })
            .eq('id', storyId)

          updateJob(job.id, {
            chapterProgress: `${story.currentChapters + offset + 1}/${story.targetChapters}`,
            createdChapters: story.currentChapters + offset + 1,
            targetChapters: story.targetChapters,
          })

          addLog(`Insert chương ${nextChapterNumber} thành công`, 'success')
          nextChapterNumber += 1

          if (offset < chaptersToCreate - 1 && config.delayMs > 0) {
            addLog(`Delay ${config.delayMs}ms trước request tiếp theo...`)
            await sleep(config.delayMs)
          }
        }

        if (!stopRequestedRef.current) {
          const finalChapterCount = Math.min(story.currentChapters + chaptersToCreate, story.targetChapters)
          const isStoryFull = finalChapterCount >= story.targetChapters

          await supabase
            .from('stories')
            .update({
              story_memory: storyMemory,
              current_arc: isStoryFull
                ? `Factory continue — completed at chapter ${finalChapterCount}`
                : `Factory continue — chapter ${finalChapterCount} generated`,
              completion_status: isStoryFull ? 'full' : 'ongoing',
              target_chapters: story.targetChapters,
            })
            .eq('id', storyId)

          updateJob(job.id, {
            status: 'success',
            chapterProgress: `${finalChapterCount}/${story.targetChapters}`,
            createdChapters: finalChapterCount,
            targetChapters: story.targetChapters,
            completionStatus: isStoryFull ? 'full' : 'ongoing',
          })

          addLog(
            isStoryFull
              ? `Xong viết tiếp ${storyTitle} — truyện đã Full.`
              : `Xong viết tiếp ${storyTitle}`,
            'success',
          )
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        updateJob(job.id, {
          status: 'failed',
          error: message,
        })
        addLog(`Viết tiếp ${storyTitle} lỗi: ${message}`, 'error')
      }
    }

    if (stopRequestedRef.current) {
      setStatus('stopped')
      setCurrentAction('Factory đã dừng theo yêu cầu')
      addLog('Factory đã dừng.', 'warning')
    } else {
      setStatus('success')
      setCurrentAction('Factory viết tiếp truyện xong')
      addLog('Factory viết tiếp truyện xong toàn bộ job.', 'success')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    setStatus('failed')
    setCurrentAction('Factory viết tiếp lỗi')
    addLog(`Factory viết tiếp lỗi: ${message}`, 'error')
  }
}
