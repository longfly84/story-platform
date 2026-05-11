import type {
  AIFactoryConfig,
  AvoidLibrary,
  CoverArtStyle,
  CoverImageQuality,
  FactoryGenreOption,
  FactoryHeroineOption,
  FactoryLog,
  FactoryStorySeed,
  ParsedChapterOutput,
} from '../aiFactoryTypes'
import {
  buildMockChapterOutput,
  randomInt,
  sleep,
} from '../aiFactoryUtils'
import {
  base64ToBlob,
  buildPublicChapterSummary,
  dataUrlToBlob,
} from './factoryPanelHelpers'
import {
  updateStoryCover,
  uploadCoverToStorage,
} from './factoryCoverStorage'
import { buildFactoryPublicStoryDescription } from './factoryPublicDescription'

const AI_ADMIN_TOKEN_STORAGE_KEY = 'story-platform-ai-admin-token'

function getAIAdminToken() {
  if (typeof window === 'undefined') return ''

  const existingToken = window.localStorage
    .getItem(AI_ADMIN_TOKEN_STORAGE_KEY)
    ?.trim()

  if (existingToken) return existingToken

  const inputToken =
    window
      .prompt(
        'Nhập AI_ADMIN_TOKEN để chạy AI Factory. Token này chỉ lưu trên máy của bạn.',
      )
      ?.trim() || ''

  if (inputToken) {
    window.localStorage.setItem(AI_ADMIN_TOKEN_STORAGE_KEY, inputToken)
  }

  return inputToken
}

function getAIAdminHeaders(): Record<string, string> {
  const token = getAIAdminToken()

  if (!token) {
    return {}
  }

  return {
    'x-ai-admin-token': token,
  }
}

type AddLog = (message: string, type?: FactoryLog['type']) => void

function normalizeCoverArtStyle(value: unknown): CoverArtStyle {
  const raw = String(value || '').trim()

  if (
    raw === 'auto' ||
    raw === 'anime_glossy' ||
    raw === 'manhwa_drama' ||
    raw === 'clean_webtoon_manhua' ||
    raw === 'cinematic_semi_realistic' ||
    raw === 'cinematic_realistic' ||
    raw === 'monochrome_collage' ||
    raw === 'promo_poster' ||
    raw === 'anime_cinematic' ||
    raw === 'manga_manhwa' ||
    raw === 'popular_webnovel_collage' ||
    raw === 'ancient_chinese_cinematic_romance'
  ) {
    return raw
  }

  // Map key cũ còn lưu trong localStorage / config cũ sang key mới.
  if (raw === 'anime-cinematic') return 'anime_glossy'
  if (raw === 'anime_cinematic') return 'anime_glossy'
  if (raw === 'modern-manhwa') return 'manhwa_drama'
  if (raw === 'manga-drama') return 'manhwa_drama'
  if (raw === 'manga_manhwa') return 'manhwa_drama'
  if (raw === 'clean-webtoon-manhua') return 'clean_webtoon_manhua'
  if (raw === 'bright_webtoon') return 'clean_webtoon_manhua'
  if (raw === 'bright-webtoon') return 'clean_webtoon_manhua'
  if (raw === 'wedding_drama_manhua') return 'clean_webtoon_manhua'
  if (raw === 'wedding-drama-manhua') return 'clean_webtoon_manhua'
  if (raw === 'semi-realistic') return 'cinematic_semi_realistic'
  if (raw === 'movie-poster') return 'cinematic_realistic'
  if (raw === 'popular-webnovel-collage') return 'monochrome_collage'
  if (raw === 'popular_webnovel_collage') return 'monochrome_collage'

  return 'auto'
}

function normalizeCoverImageQuality(value: unknown): CoverImageQuality {
  const raw = String(value || '').trim().toLowerCase()
  return raw === 'high' ? 'high' : 'medium'
}

function getCoverArtStyleLabel(style: AIFactoryConfig['coverArtStyle']) {
  switch (normalizeCoverArtStyle(style)) {
    case 'anime_glossy':
      return 'Anime webnovel bóng bẩy — glossy Chinese webnovel anime/manhua cover, đẹp nhưng vẫn ưu tiên kể chuyện'
    case 'manhwa_drama':
      return 'Manhwa / Manhua drama — nét rõ, giàu cảm xúc, hợp bìa truyện drama'
    case 'clean_webtoon_manhua':
      return 'Clean Webtoon / Manhua — nét sạch, màu sáng, biểu cảm rõ, hợp drama hào môn / cưới hỏi / đối đầu công khai'
    case 'cinematic_semi_realistic':
      return 'Cinematic semi-realistic — poster phim minh họa, gần thật nhưng vẫn là tranh'
    case 'cinematic_realistic':
      return 'Cinematic realistic — poster phim đô thị cao cấp, thật hơn anime'
    case 'monochrome_collage':
      return 'Collage đơn sắc — nhiều mảnh truyện, tông u tối / drama'
    case 'promo_poster':
      return 'Poster quảng bá nhiều lớp — webnovel marketing poster, giàu tình tiết'
    case 'ancient_chinese_cinematic_romance':
      return 'Cổ phong ngôn tình điện ảnh'
    case 'anime_cinematic':
      return 'Anime cinematic cũ — tự map gần anime webnovel bóng bẩy'
    case 'manga_manhwa':
      return 'Manga / Manhwa cũ — tự map gần manhwa drama'
    case 'popular_webnovel_collage':
      return 'Webnovel collage cũ — tự map gần collage nhiều lớp'
    case 'auto':
    default:
      return 'Tự động theo nội dung truyện'
  }
}

function normalizeCoverCompositionPreset(
  value: unknown,
): AIFactoryConfig['coverCompositionPreset'] {
  const raw = String(value || '').trim()

  if (
    raw === 'auto' ||
    raw === 'single_heroine_center' ||
    raw === 'public_confrontation' ||
    raw === 'evidence_focus' ||
    raw === 'mother_child_protection' ||
    raw === 'betrayal_triangle' ||
    raw === 'collage_story_poster' ||
    raw === 'story_scene_offset' ||
    raw === 'luxury_collage'
  ) {
    return raw as AIFactoryConfig['coverCompositionPreset']
  }

  if (raw === 'single-heroine-center') return 'single_heroine_center'
  if (raw === 'public-reveal' || raw === 'public') return 'public_confrontation'
  if (raw === 'evidence') return 'evidence_focus'
  if (raw === 'mother-child' || raw === 'mother_child' || raw === 'custody') return 'mother_child_protection'
  if (raw === 'betrayal' || raw === 'private-betrayal') return 'betrayal_triangle'
  if (raw === 'collage' || raw === 'story_collage' || raw === 'luxury-collage') return 'collage_story_poster'

  if (raw === 'story-scene-offset') return 'story_scene_offset'
  if (raw === 'luxury-collage') return 'luxury_collage'

  return 'auto'
}

function mapCompositionPresetToSceneType(
  value: AIFactoryConfig['coverCompositionPreset'],
): AIFactoryConfig['coverSceneType'] {
  switch (normalizeCoverCompositionPreset(value)) {
    case 'collage_story_poster':
    case 'luxury_collage':
      return 'collage_story_poster'
    case 'mother_child_protection':
      return 'mother_child_protection'
    case 'evidence_focus':
      return 'evidence_discovery_scene'
    case 'public_confrontation':
      return 'public_reveal_confrontation'
    case 'betrayal_triangle':
      return 'private_betrayal_confrontation'
    case 'single_heroine_center':
    case 'story_scene_offset':
    case 'auto':
    default:
      return 'auto_story_scene'
  }
}

function normalizeCoverSceneType(value: unknown): AIFactoryConfig['coverSceneType'] {
  const raw = String(value || '').trim()

  if (
    raw === 'auto_story_scene' ||
    raw === 'collage_story_poster' ||
    raw === 'mother_child_protection' ||
    raw === 'evidence_discovery_scene' ||
    raw === 'public_reveal_confrontation' ||
    raw === 'private_betrayal_confrontation' ||
    raw === 'hospital_legal_suspense' ||
    raw === 'school_parent_conflict' ||
    raw === 'airport_secret_tension' ||
    raw === 'family_banquet_confrontation' ||
    raw === 'boardroom_evidence_reveal'
  ) {
    return raw as AIFactoryConfig['coverSceneType']
  }

  if (raw === 'auto' || raw === '') return 'auto_story_scene'
  if (raw === 'collage' || raw === 'story_collage' || raw === 'luxury_collage') return 'collage_story_poster'
  if (raw === 'mother_child' || raw === 'custody') return 'mother_child_protection'
  if (raw === 'evidence') return 'evidence_discovery_scene'
  if (raw === 'public_reveal' || raw === 'public') return 'public_reveal_confrontation'
  if (raw === 'private_betrayal' || raw === 'betrayal') return 'private_betrayal_confrontation'
  if (raw === 'hospital' || raw === 'medical') return 'hospital_legal_suspense'
  if (raw === 'school') return 'school_parent_conflict'
  if (raw === 'airport') return 'airport_secret_tension'
  if (raw === 'family_banquet' || raw === 'family') return 'family_banquet_confrontation'
  if (raw === 'boardroom' || raw === 'corporate') return 'boardroom_evidence_reveal'

  return 'auto_story_scene'
}

type SupabaseLike = {
  from: (table: string) => any
}

type QualityGateIssuePayload = {
  code?: string
  severity?: string
  message?: string
  sample?: string
}

type QualityGatePayload = {
  score?: number
  passed?: boolean
  errors?: QualityGateIssuePayload[]
  warnings?: QualityGateIssuePayload[]
  metrics?: Record<string, unknown>
}

function compactErrorText(value: unknown, maxLength = 220) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

function formatQualityGateIssue(issue: QualityGateIssuePayload, index: number) {
  const code = issue.code ? `[${issue.code}] ` : ''
  const sample = issue.sample ? ` Ví dụ: ${compactErrorText(issue.sample, 140)}` : ''
  return `${index + 1}. ${code}${issue.message || 'Không rõ lỗi'}${sample}`
}

function formatQualityGateForLog(data: any) {
  const gate = data?.qualityGate as QualityGatePayload | undefined
  if (!gate) return ''

  const errors = Array.isArray(gate.errors) ? gate.errors : []
  const warnings = Array.isArray(gate.warnings) ? gate.warnings : []
  const issueLines = [...errors, ...warnings]
    .slice(0, 5)
    .map(formatQualityGateIssue)

  const metrics = gate.metrics
    ? [
        typeof gate.metrics.first700LikeCount === 'number'
          ? `như/700=${gate.metrics.first700LikeCount}`
          : '',
        typeof gate.metrics.totalLikeCount === 'number'
          ? `như/all=${gate.metrics.totalLikeCount}`
          : '',
        typeof gate.metrics.corporateDriftCount === 'number'
          ? `drift=${gate.metrics.corporateDriftCount}`
          : '',
        typeof gate.metrics.powerWordCount === 'number'
          ? `power=${gate.metrics.powerWordCount}`
          : '',
      ]
        .filter(Boolean)
        .join(', ')
    : ''

  return [
    `Quality Gate fail${typeof gate.score === 'number' ? ` (${gate.score}/100)` : ''}.`,
    issueLines.length ? issueLines.join(' | ') : '',
    metrics ? `Metrics: ${metrics}.` : '',
    data?.qualityRewriteError ? `Rewrite: ${data.qualityRewriteError}` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function buildGenerateApiErrorMessage(response: Response, data: any) {
  if (response.status === 422 && data?.qualityGate) {
    return formatQualityGateForLog(data) || 'Story failed quality gate.'
  }

  return data?.error || data?.message || `OpenAI generate request failed (${response.status})`
}

export async function generateFactoryChapter(params: {
  config: AIFactoryConfig
  provider: AIFactoryConfig['provider']
  modelKey: AIFactoryConfig['modelKey']
  storyTitle: string
  storyDescription: string
  genreLabel: string
  heroineLabel: string
  chapterNumber: number
  targetChapters: number
  isFinalChapter?: boolean
  recentChapters: Array<{
    chapter_number: number
    title: string
    content: string
    summary?: string
  }>
  storyMemory: string
  factoryPromptIdea: string
  runShortId: string
  storySeed?: FactoryStorySeed | null
}) {
  if (params.provider === 'mock') {
    await sleep(500)
    return buildMockChapterOutput({
      chapterNumber: params.chapterNumber,
      genreLabel: params.genreLabel,
      heroineLabel: params.heroineLabel,
      runShortId: params.runShortId,
    })
  }

  const finalChapterInstruction = params.isFinalChapter
    ? `
ĐÂY LÀ CHƯƠNG CUỐI CỦA TRUYỆN.

Yêu cầu bắt buộc:
- Đây là chương ${params.chapterNumber}/${params.targetChapters}, phải kết thúc toàn bộ truyện.
- Phải giải quyết xung đột chính.
- Phải trả giá/payoff các bí mật, bằng chứng, mâu thuẫn đã cài từ các chương trước.
- Phản diện phải nhận hậu quả rõ ràng.
- Nữ chính phải có kết cục rõ ràng.
- Không mở thêm tuyến truyện mới.
- Không tạo cliffhanger giả.
- Không kết bằng kiểu "mọi chuyện chỉ mới bắt đầu".
- Kết chương phải cho độc giả cảm giác truyện đã hoàn thành.
- Trong bản kỹ thuật ghi completion_status = full.
`
    : `
Đây chưa phải chương cuối.
Vị trí hiện tại: chương ${params.chapterNumber}/${params.targetChapters}.
Yêu cầu:
- Không kết thúc toàn bộ truyện quá sớm.
- Không cho phản diện sụp đổ hoàn toàn quá sớm.
- Vẫn phải giữ mạch để đọc tiếp chương sau.
- Trong bản kỹ thuật ghi completion_status = ongoing.
`

  const payload = {
    mode: 'chapter',
    provider: params.provider,
    modelKey: params.modelKey,
    moduleId: 'female-urban-viral',
    title: params.storyTitle,
    storySummary: params.storyDescription,
    promptIdea: [
      params.chapterNumber === 1 ? params.factoryPromptIdea : '',
      params.isFinalChapter ? finalChapterInstruction : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
    genreLabel: params.genreLabel,
    mainCharacterStyleLabel: params.heroineLabel,
    chapterLengthLabel: `Tùy chỉnh — khoảng ${Number((params.config as any).chapterMinChars ?? 3500)}–${Number((params.config as any).chapterMaxChars ?? 4500)} ký tự`,
    chapterMinChars: Number((params.config as any).chapterMinChars ?? 3500),
    chapterMaxChars: Number((params.config as any).chapterMaxChars ?? 4500),
    cliffhangerLabel: params.config.cliffhangerLabel,
    humiliationLevel: randomInt(3, 5),
    revengeIntensity: randomInt(3, 5),
    nextChapterNumber: params.chapterNumber,
    targetChapters: params.targetChapters,
    isFinalChapter: Boolean(params.isFinalChapter),
    storySeed: params.storySeed ?? null,
    storyEditorMode: params.config.storyEditorMode,
    storyEditorPassEnabled: params.config.storyEditorMode !== 'off',
    recentChapters: params.recentChapters,
    storyMemory: [params.storyMemory, finalChapterInstruction].filter(Boolean).join('\n\n---\n\n'),
  }

  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAIAdminHeaders(),
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(buildGenerateApiErrorMessage(response, data))
  }

  const text = data?.text || data?.output_text || data?.content

  if (!text || typeof text !== 'string') {
    throw new Error('API không trả về text hợp lệ.')
  }

  return text
}

function normalizeTitleForCompare(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function slugifyFactoryStoryTitle(value: string) {
  const base = normalizeTitleForCompare(value).replace(/\s+/g, '-').replace(/^-+|-+$/g, '')
  return base || `factory-story-${Date.now()}`
}

function makeFactoryStorySlugUnique(baseSlug: string, factoryRunId: string, storyIndex: number) {
  const cleanBase = String(baseSlug || '')
    .replace(/^-+|-+$/g, '')
    .trim()

  const runPart = normalizeTitleForCompare(factoryRunId || '')
    .replace(/\s+/g, '')
    .slice(0, 8)

  const suffix = [runPart, `s${storyIndex}`].filter(Boolean).join('-')
  const uniqueSlug = [cleanBase || 'factory-story', suffix].filter(Boolean).join('-')

  return uniqueSlug.replace(/-+/g, '-').replace(/^-+|-+$/g, '')
}

function isBadParsedFactoryTitle(value: string) {
  const normalized = normalizeTitleForCompare(value)

  if (!normalized) return true

  return [
    'chua dat ten',
    'vat chung bi dat sai cho',
    'mon qua bi lo',
    'dau muc tren trang cu',
    'nguoi im lang o cuoi phong',
    'ma qr dan toi thu muc an',
    'dong ma tren ve su kien',
    'tin nhan gui nham vao nhom gia dinh',
    'vet but chi sau gio don tre',
    'manh moi o hien truong',
    'dau chi khac mau',
    'tam the phong bi bo quen',
    'the phong quet luc nua dem',
    'dau quet tren the phong',
    'mon do choi trong phong hop',
    'mon do choi bi dat sai',
    'hoa don hoa gui sai ten',
    'khung hinh bi cat khoi camera',
    'tam ve mot chieu trong ngan keo',
    'dau do tren ban hop dong',
    'truyen moi tu ai writer phu hop voi vat chung trung tam',
  ].includes(normalized)
}

function compactTitleTags(value: string) {
  return normalizeTitleForCompare(value)
    .split(/\s+/)
    .filter(
      (tag) =>
        tag.length >= 3 &&
        ![
          'mot',
          'mau',
          'dau',
          'noi',
          'ben',
          'sai',
          'dat',
          'cho',
          'trong',
          'tren',
          'duoi',
          'goc',
          'cu',
          'bi',
          'cua',
          'voi',
          'sau',
          'truoc',
        ].includes(tag),
    )
}

function getSeedEvidenceObject(storySeed?: FactoryStorySeed | null) {
  return String(
    storySeed?.evidenceObject ||
      storySeed?.motifFingerprint?.evidenceObject ||
      '',
  ).trim()
}

function titleMatchesSeedEvidence(title: string, storySeed?: FactoryStorySeed | null) {
  const evidence = getSeedEvidenceObject(storySeed)
  const titleTags = new Set(compactTitleTags(title))
  const evidenceTags = compactTitleTags(evidence)

  if (!evidenceTags.length || !titleTags.size) return false

  return evidenceTags.some((tag) => titleTags.has(tag))
}

function isLockerCardEvidenceTitleText(value: string) {
  const normalized = normalizeTitleForCompare(value)

  return (
    normalized.includes('the tu do') ||
    normalized.includes('tu do') ||
    normalized.includes('locker') ||
    normalized.includes('phong tap') ||
    normalized.includes('cau lac bo the thao') ||
    normalized.includes('the ra vao') ||
    normalized.includes('so thanh vien')
  )
}

function makeFactoryTitleFromEvidence(storySeed?: FactoryStorySeed | null) {
  const evidence = getSeedEvidenceObject(storySeed)
  const normalized = normalizeTitleForCompare(evidence)

  if (isLockerCardEvidenceTitleText(evidence)) {
    return 'Tấm Thẻ Tủ Đồ Bị Đặt Sai'
  }

  if (normalized.includes('buc ve') || normalized.includes('tranh tre') || normalized.includes('ve tre')) {
    return 'Bức Vẽ Lệch Khung'
  }

  if (normalized.includes('anh mo') || normalized.includes('may anh do choi')) {
    return 'Ảnh Mờ Trong Máy Ảnh Đồ Chơi'
  }

  if (normalized.includes('mieng dan')) {
    return 'Miếng Dán Bong Góc'
  }

  if (normalized.includes('nap chai') || normalized.includes('vet xuoc')) {
    return 'Nắp Chai Có Vết Xước'
  }

  if (normalized.includes('hat vong')) {
    return 'Hạt Vòng Sai Chỗ'
  }

  if (normalized.includes('vong tay')) {
    return 'Vòng Tay Sự Kiện Bị Đổi Màu'
  }

  if (normalized.includes('nhan chau') || normalized.includes('chau hoa')) {
    return 'Chậu Cây Bị Cắm Sai Nhãn'
  }

  if (
    normalized.includes('soi chi') ||
    normalized.includes('khuy ao') ||
    normalized.includes('chi con mac') ||
    normalized.includes('chi lech')
  ) {
    return 'Sợi Chỉ Ở Khuy Áo'
  }

  if (normalized.includes('to giay') || normalized.includes('mau giay') || normalized.includes('ghi chu')) {
    return 'Tờ Giấy Trước Thang Máy'
  }

  if (normalized.includes('phieu') && normalized.includes('banh')) {
    return 'Phiếu Bánh Bị Xé Góc'
  }

  if (evidence) {
    const clean = evidence
      .replace(/^một\s+/i, '')
      .replace(/^một chiếc\s+/i, 'Chiếc ')
      .replace(/^một tấm\s+/i, 'Tấm ')
      .replace(/^một mẩu\s+/i, 'Mẩu ')
      .replace(/\s+không phải.*$/i, '')
      .replace(/\s+bị đặt sai chỗ$/i, '')
      .trim()

    if (clean && clean.length <= 34) {
      return clean.charAt(0).toUpperCase() + clean.slice(1)
    }
  }

  return 'Chi Tiết Bị Đặt Sai'
}

function isAcceptableFactoryStoryTitle(title: string, storySeed?: FactoryStorySeed | null) {
  if (!title || isBadParsedFactoryTitle(title)) return false
  return titleMatchesSeedEvidence(title, storySeed)
}

function chooseFactoryStoryTitle(params: {
  parsedTitle: string
  parsedSlug: string
  parsedChapterTitle?: string
  storySeed?: FactoryStorySeed | null
}) {
  const seedTitle = String(params.storySeed?.title || '').trim()
  const parsedTitle = String(params.parsedTitle || '').trim()
  const parsedChapterTitle = String(params.parsedChapterTitle || '').trim()
  const evidenceTitle = makeFactoryTitleFromEvidence(params.storySeed)

  // V20 hard rule:
  // Story title saved to DB must be evidence-first. Parsed title from AI is only used
  // if it matches the seed evidence and is not generic. Seed title is only fallback
  // when it also passes the evidence gate. This prevents old seed/generic titles
  // like "Manh Mối Ở Hiện Trường" from being inserted.
  const candidates = [evidenceTitle, parsedChapterTitle, parsedTitle, seedTitle]
  const chosen =
    candidates.find((title) => isAcceptableFactoryStoryTitle(title, params.storySeed)) ||
    evidenceTitle ||
    'Chi Tiết Bị Đặt Sai'

  const original = seedTitle || parsedTitle || parsedChapterTitle
  const replaced = normalizeTitleForCompare(chosen) !== normalizeTitleForCompare(original)

  return {
    title: chosen,
    slug: slugifyFactoryStoryTitle(chosen),
    replaced,
    original,
    evidenceTitle,
    parsedTitle,
    parsedChapterTitle,
    seedTitle,
  }
}

function assertFactoryTitleGatePassed(title: string, storySeed?: FactoryStorySeed | null) {
  if (!isAcceptableFactoryStoryTitle(title, storySeed)) {
    const evidenceTitle = makeFactoryTitleFromEvidence(storySeed)
    throw new Error(
      `Factory title gate failed before insert. title="${title}", evidenceTitle="${evidenceTitle}", evidence="${getSeedEvidenceObject(storySeed)}"`,
    )
  }
}

export async function insertFactoryStoryDraft(params: {
  supabase: SupabaseLike
  avoidLibrary: AvoidLibrary
  addLog: AddLog
  parsed: ParsedChapterOutput
  genre: FactoryGenreOption
  heroine: FactoryHeroineOption
  config: AIFactoryConfig
  factoryRunId: string
  storyIndex: number
  targetChapters: number
  technicalReport: string
  premiseSeed: string
  nameSeed: string
  storySeed?: FactoryStorySeed | null
}) {
  const generatedChaptersNow = params.config.autoCompleteByTarget
    ? params.targetChapters
    : params.config.chaptersToGenerateNow

  const storyDna = {
    source: 'ai-factory',
    factory_run_id: params.factoryRunId,
    story_index: params.storyIndex,
    genre_key: params.genre.key,
    genre_label: params.genre.label,
    heroine_style_key: params.heroine.key,
    heroine_style_label: params.heroine.label,
    model_key: params.config.modelKey,
    module_id: 'female-urban-viral',
    target_chapters: params.targetChapters,
    factory_seed: params.storySeed ?? null,
    motifFingerprint: params.storySeed?.motifFingerprint ?? null,
    motifText: params.storySeed?.motifText ?? null,
    motifEmbedding: params.storySeed?.motifEmbedding ?? null,
    motifSimilarity: params.storySeed?.motifSimilarity ?? null,
    generated_chapters_now: generatedChaptersNow,
    auto_complete_by_target: params.config.autoCompleteByTarget,
    chapter_length_label: `Tùy chỉnh — khoảng ${Number((params.config as any).chapterMinChars ?? 3500)}–${Number((params.config as any).chapterMaxChars ?? 4500)} ký tự`,
    chapter_min_chars: Number((params.config as any).chapterMinChars ?? 3500),
    chapter_max_chars: Number((params.config as any).chapterMaxChars ?? 4500),
    cliffhanger_type_key: 'auto',
    humiliation_level: 'random_3_5',
    revenge_intensity: 'random_3_5',
    premise_seed: params.premiseSeed,
    name_seed: params.nameSeed,
    avoid_context_used: {
      titles_count: params.avoidLibrary.titles.length,
      motifs_count: params.avoidLibrary.motifs.length,
      character_names_count: params.avoidLibrary.characterNames.length,
      company_names_count: params.avoidLibrary.companyNames.length,
      motif_fingerprints_count: params.avoidLibrary.motifFingerprints?.length ?? 0,
      motif_texts_count: params.avoidLibrary.motifTexts?.length ?? 0,
    },
    character_names: [],
    company_names: [],
  }

  const chosenStoryTitle = chooseFactoryStoryTitle({
    parsedTitle: params.parsed.storyTitle,
    parsedSlug: params.parsed.storySlug,
    parsedChapterTitle: params.parsed.chapterTitle,
    storySeed: params.storySeed,
  })

  params.addLog(
    `Title gate final: "${chosenStoryTitle.title}" | seed="${chosenStoryTitle.seedTitle}" | parsed="${chosenStoryTitle.parsedTitle}" | chapter="${chosenStoryTitle.parsedChapterTitle}" | evidence="${chosenStoryTitle.evidenceTitle}"`,
    chosenStoryTitle.replaced ? 'warning' : 'info',
  )

  if (chosenStoryTitle.replaced) {
    params.addLog(
      `Title gate changed: "${chosenStoryTitle.original}" → "${chosenStoryTitle.title}"`,
      'warning',
    )
  }

  assertFactoryTitleGatePassed(chosenStoryTitle.title, params.storySeed)

  const finalStorySlug = makeFactoryStorySlugUnique(
    chosenStoryTitle.slug,
    params.factoryRunId,
    params.storyIndex,
  )

  if (finalStorySlug !== chosenStoryTitle.slug) {
    params.addLog(
      `Slug gate changed: "${chosenStoryTitle.slug}" → "${finalStorySlug}" để tránh trùng slug Supabase.`,
      'warning',
    )
  }

  const publicDescription = buildFactoryPublicStoryDescription({
    parsed: {
      ...params.parsed,
      storyTitle: chosenStoryTitle.title,
      storySlug: finalStorySlug,
    },
    genreLabel: params.genre.label,
    heroineLabel: params.heroine.label,
    storySeed: params.storySeed,
  })

  const fullPayload = {
    title: chosenStoryTitle.title,
    slug: finalStorySlug,
    description: publicDescription,
    author: 'Sưu Tầm',
    status: params.config.storyStatus,
    completion_status: 'ongoing',
    target_chapters: params.targetChapters,
    genres: [params.genre.slug],
    story_dna: storyDna,
    story_memory: params.technicalReport,
    current_arc: 'Factory draft — chapter 1 generated',
    emotion_tags: [params.genre.label, params.heroine.label],
  }

  let result = await params.supabase.from('stories').insert(fullPayload).select('id, title, slug').single()

  if (result.error) {
    params.addLog(`Insert story mở rộng lỗi, thử insert tối thiểu: ${result.error.message}`, 'warning')

    result = await params.supabase
      .from('stories')
      .insert({
        title: chosenStoryTitle.title,
        slug: finalStorySlug,
        description: publicDescription,
        author: 'Sưu Tầm',
        status: params.config.storyStatus,
        genres: [params.genre.slug],
      })
      .select('id, title, slug')
      .single()
  }

  if (result.error || !result.data?.id) {
    throw new Error(result.error?.message || 'Không insert được story draft.')
  }

  return result.data as { id: string; title: string; slug: string }
}

export async function insertFactoryChapterDraft(params: {
  supabase: SupabaseLike
  addLog: AddLog
  storyId: string
  parsed: ParsedChapterOutput
  chapterNumber: number
  status: 'draft'
}) {
  let result = await params.supabase
    .from('chapters')
    .insert({
      story_id: params.storyId,
      title: params.parsed.chapterTitle,
      slug: params.parsed.chapterSlug,
      content: params.parsed.readerOnly,
      summary: buildPublicChapterSummary(params.parsed.readerOnly),
      chapter_number: params.chapterNumber,
      status: params.status,
    })
    .select('id, title, chapter_number')
    .single()

  if (result.error) {
    params.addLog(`Insert chapter có status lỗi, thử bỏ status: ${result.error.message}`, 'warning')

    result = await params.supabase
      .from('chapters')
      .insert({
        story_id: params.storyId,
        title: params.parsed.chapterTitle,
        slug: params.parsed.chapterSlug,
        content: params.parsed.readerOnly,
        summary: buildPublicChapterSummary(params.parsed.readerOnly),
        chapter_number: params.chapterNumber,
      })
      .select('id, title, chapter_number')
      .single()
  }

  if (result.error || !result.data?.id) {
    throw new Error(result.error?.message || 'Không insert được chapter draft.')
  }

  return result.data as { id: string; title: string; chapter_number: number }
}

export async function generateAndAttachFactoryCover(params: {
  config: AIFactoryConfig
  storyId: string
  storyTitle: string
  storySlug: string
  storyDescription: string
  genreLabel: string
  heroineLabel: string
  storySeed?: FactoryStorySeed | null
}) {
    const normalizedCoverArtStyle = normalizeCoverArtStyle(params.config.coverArtStyle)
  const normalizedCoverCompositionPreset = normalizeCoverCompositionPreset(
    params.config.coverCompositionPreset || 'auto',
  )

  const sceneTypeFromComposition = mapCompositionPresetToSceneType(
    normalizedCoverCompositionPreset,
  )

  const normalizedCoverSceneType = normalizeCoverSceneType(
    params.config.coverSceneType && params.config.coverSceneType !== 'auto_story_scene'
      ? params.config.coverSceneType
      : sceneTypeFromComposition,
  )
  const normalizedCoverImageQuality = normalizeCoverImageQuality(
    params.config.coverImageQuality,
  )

  const storyDna = params.storySeed
    ? {
        ...params.storySeed,
        factory_seed: params.storySeed,
        motifFingerprint: params.storySeed.motifFingerprint ?? null,
        motifText: params.storySeed.motifText ?? null,
        coverConcept: (params.storySeed as any).coverConcept ?? null,
      }
    : null

  const response = await fetch('/api/ai/generate-cover', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAIAdminHeaders(),
    },
    body: JSON.stringify({
      provider: 'openai',
      modelKey: params.config.modelKey,
      title: params.storyTitle,
      storySummary: params.storyDescription,
      genreLabel: params.genreLabel,
      heroineLabel: params.heroineLabel,
      story_dna: storyDna,
      story: {
        id: params.storyId,
        title: params.storyTitle,
        slug: params.storySlug,
        summary: params.storyDescription,
        genreLabel: params.genreLabel,
        tags: [params.genreLabel, params.heroineLabel].filter(Boolean),
        story_dna: storyDna,
        coverCompositionPreset: normalizedCoverCompositionPreset,
        cover_composition_preset: normalizedCoverCompositionPreset,
        suggestedCoverSceneType: normalizedCoverSceneType,
        suggested_cover_scene_type: normalizedCoverSceneType,
      },
      cover_art_style: normalizedCoverArtStyle,
      visual_style: normalizedCoverArtStyle,
      style: normalizedCoverArtStyle,
      styleLabel: getCoverArtStyleLabel(normalizedCoverArtStyle),
      coverStyleLabel: getCoverArtStyleLabel(normalizedCoverArtStyle),
      coverLayoutKey: normalizedCoverCompositionPreset,
      coverCompositionPreset: normalizedCoverCompositionPreset,
      cover_composition_preset: normalizedCoverCompositionPreset,
      suggestedCoverSceneType: normalizedCoverSceneType,
      suggested_cover_scene_type: normalizedCoverSceneType,
      coverQuality: normalizedCoverImageQuality,
      imageQuality: normalizedCoverImageQuality,
      quality: normalizedCoverImageQuality,
      aspectRatio: '2:3',
    }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Generate cover API failed.')
  }

  if (data?.publicUrl && typeof data.publicUrl === 'string') {
    await updateStoryCover({
      storyId: params.storyId,
      coverUrl: data.publicUrl,
    })
    return data.publicUrl as string
  }

  if (data?.imageUrl && typeof data.imageUrl === 'string') {
    await updateStoryCover({
      storyId: params.storyId,
      coverUrl: data.imageUrl,
    })
    return data.imageUrl as string
  }

  let imageBlob: Blob | null = null

  if (data?.b64_json && typeof data.b64_json === 'string') {
    imageBlob = base64ToBlob(data.b64_json, 'image/png')
  } else if (data?.dataUrl && typeof data.dataUrl === 'string') {
    imageBlob = dataUrlToBlob(data.dataUrl)
  }

  if (!imageBlob) {
    throw new Error('API cover không trả imageUrl/publicUrl/b64_json/dataUrl hợp lệ.')
  }

  const publicUrl = await uploadCoverToStorage({
    storyId: params.storyId,
    storySlug: params.storySlug,
    fileBlob: imageBlob,
  })

  await updateStoryCover({
    storyId: params.storyId,
    coverUrl: publicUrl,
  })

  return publicUrl
}