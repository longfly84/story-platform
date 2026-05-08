import type {
  AIFactoryConfig,
  AvoidLibrary,
  CoverArtStyle,
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

type AddLog = (message: string, type?: FactoryLog['type']) => void

function normalizeCoverArtStyle(value: unknown): CoverArtStyle {
  const raw = String(value || '').trim()

  if (
    raw === 'auto' ||
    raw === 'anime_cinematic' ||
    raw === 'manga_manhwa' ||
    raw === 'cinematic_realistic' ||
    raw === 'popular_webnovel_collage'
  ) {
    return raw
  }

  // Map key cũ còn lưu trong localStorage / config cũ sang key mới.
  if (raw === 'anime-cinematic') return 'anime_cinematic'
  if (raw === 'modern-manhwa') return 'manga_manhwa'
  if (raw === 'manga-drama') return 'manga_manhwa'
  if (raw === 'semi-realistic') return 'cinematic_realistic'
  if (raw === 'movie-poster') return 'popular_webnovel_collage'

  return 'auto'
}

function getCoverArtStyleLabel(style: AIFactoryConfig['coverArtStyle']) {
  switch (normalizeCoverArtStyle(style)) {
    case 'anime_cinematic':
      return 'Anime — Chinese commercial webnovel cover, glossy mature anime-inspired Chinese webnovel beauty, luxury urban drama color'
    case 'manga_manhwa':
      return 'Manga — Chinese commercial webnovel cover, polished manga/manhua-inspired line art, luxury full-color rendering'
    case 'popular_webnovel_collage':
      return 'Chinese manhua luxury collage, layered storytelling, 3 to 7 story fragments, glossy premium Chinese webnovel cover'
    case 'cinematic_realistic':
      return 'Siêu thực — ultra-realistic Chinese urban drama premium poster illustration, luxury cinematic realism'
    case 'auto':
    default:
      return 'premium Chinese commercial webnovel cover, automatically matched to story content'
  }
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



function getSeedEvidenceForPrompt(storySeed?: FactoryStorySeed | null) {
  return String(
    storySeed?.evidenceObject ||
      (storySeed as any)?.motifFingerprint?.evidenceObject ||
      '',
  ).trim()
}

function buildChapterSeedLockInstruction(params: {
  storyTitle: string
  storySeed?: FactoryStorySeed | null
}) {
  const storySeed = params.storySeed
  const evidenceObject = getSeedEvidenceForPrompt(storySeed)
  const lockedTitle = String(params.storyTitle || storySeed?.title || evidenceObject || '').trim()

  if (!storySeed && !lockedTitle && !evidenceObject) return ''

  return `
FACTORY STORY LOCK - KHÓA NGHĨA TRƯỚC KHI VIẾT:
- STORY_TITLE_LOCK: ${lockedTitle}
- EVIDENCE_OBJECT_LOCK: ${evidenceObject || lockedTitle}
- SETTING_LOCK: ${storySeed?.setting || storySeed?.openingScene || ''}
- OPENING_SCENE_LOCK: ${storySeed?.openingScene || storySeed?.setting || ''}
- CONFLICT_LOCK: ${storySeed?.mainConflict || storySeed?.corePremise || ''}
- HIDDEN_TRUTH_LOCK: ${storySeed?.hiddenTruth || ''}

QUY TẮC CỨNG CHO OPENAI:
1. Trước khi viết chương, phải tự hiểu EVIDENCE_OBJECT_LOCK là vật chứng chính. Không được tách chữ rời, không được đoán theo một token ngắn.
2. story_title trong technical report PHẢI ĐÚNG Y HỆT STORY_TITLE_LOCK. Không được tự đặt lại thành hợp đồng, USB, camera, mã QR, thẻ phòng, hồ sơ niêm phong, ghi âm, sao kê nếu EVIDENCE_OBJECT_LOCK không ghi rõ.
3. Chương 1 phải mở bằng tình huống làm EVIDENCE_OBJECT_LOCK xuất hiện sai/ lệch/ bất thường trong SETTING_LOCK. Vật chứng này phải là trung tâm cảnh, không phải chi tiết trang trí.
4. Bằng chứng phụ chỉ được hỗ trợ vật chứng chính. Cấm thay vật chứng chính bằng vật chứng khác hấp dẫn hơn.
5. Nếu muốn dùng hợp đồng, USB, camera, hồ sơ, luật sư, pháp vụ, sao kê, chỉ được dùng khi chúng đã có trong seed. Nếu không có trong seed thì cấm dùng làm trục truyện hoặc title.
6. Mỗi đoạn quan trọng phải trả lời ngầm: ai nhìn thấy vật chứng, nó lệch ở đâu, vì sao nữ chính nhận ra, và nó dẫn tới HIDDEN_TRUTH_LOCK thế nào.
7. Output technical report bắt buộc dùng:
   story_title = ${lockedTitle}
   evidence_object = ${evidenceObject || lockedTitle}
`.trim()
}



function buildNaturalVietnameseProseInstruction() {
  return `
NATURAL VIETNAMESE PROSE LOCK - GIỌNG VĂN NGƯỜI VIỆT:
Mục tiêu: đọc như truyện mạng tiếng Việt do người thật viết, không giống bản dịch máy hoặc văn mẫu AI.

Bắt buộc khi viết chương:
1. Cảnh căng phải dùng câu ngắn hơn. Ưu tiên hành động, ánh mắt, cử chỉ, lời thoại và phản ứng đám đông thay vì giải thích tâm lý dài.
2. Đối thoại phải đời thường, có va chạm. Nhân vật đang tức giận/hoang mang không nói quá lịch sự, quá tròn câu hoặc như đang đọc biên bản.
3. Giảm câu trừu tượng kiểu: "quyền lực rời khỏi mình", "bản cáo trạng", "con dấu", "ván cờ", "sân khấu", "khán đài", "áp lực dồn lên". Nếu cần, thay bằng câu cụ thể hơn: "Tôi biết mình đang mất thế", "Đám đông không còn nghe tôi nữa".
4. Không giảng logic cho độc giả bằng câu phân tích lộ liễu như "Cái chỗ vụng về trong câu chuyện hiện ra". Hãy để nhân vật nhận ra qua chi tiết: nét bút, vị trí vật chứng, lời nói mâu thuẫn, camera, nhân chứng.
5. Mỗi đoạn 2-4 câu là chính. Tránh đoạn văn quá đều, quá sạch, quá giống AI.
6. Mỗi cảnh phải có ít nhất một chi tiết đời thường cụ thể: âm thanh, vật nhỏ, thao tác tay, ánh mắt, điện thoại, mùi, vết bẩn, tiếng người chen vào.
7. Nữ chính bình tĩnh nhưng không nói như luật sư trong mọi cảnh. Khi bị ép trước đám đông, lời nói phải gọn, có lực, dễ hiểu.
8. Không dùng nhiều mỹ từ. Không cố làm văn. Ưu tiên rõ, sắc, tự nhiên, có nhịp truyện.

Ví dụ chuyển giọng:
- Không viết: "Tôi cảm thấy quyền lực rời khỏi mình."
- Nên viết: "Tôi biết mình đang mất thế. Đám đông đã ngả về phía họ."
- Không viết: "Chúng tôi không có nhiều thời gian. Chúng tôi cần biết con mình an toàn."
- Nên viết: "Cô nói thẳng đi. Con tôi có an toàn không?"
`.trim()
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

  const storyLockInstruction = buildChapterSeedLockInstruction({
    storyTitle: params.storyTitle,
    storySeed: params.storySeed,
  })

  const payload = {
    mode: 'chapter',
    storyEditorPassEnabled: Boolean(params.config.storyEditorPassEnabled),
    provider: params.provider,
    modelKey: params.modelKey,
    moduleId: 'female-urban-viral',
    title: params.storyTitle,
    storySummary: params.storyDescription,
    promptIdea: [
      storyLockInstruction,
      buildNaturalVietnameseProseInstruction(),
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
    recentChapters: params.recentChapters,
    storyMemory: [params.storyMemory, finalChapterInstruction].filter(Boolean).join('\n\n---\n\n'),
  }

  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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

function titleCaseFactoryEvidence(input: string) {
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

function hasFactoryEvidenceState(input: string) {
  const normalized = ` ${normalizeTitleForCompare(input)} `
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

function cleanFactoryEvidenceForTitle(input: string) {
  return String(input || '')
    .trim()
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


function titleMatchesSeedEvidence(title: string, storySeed?: FactoryStorySeed | null) {
  const evidence = getSeedEvidenceObject(storySeed)
  const titleTags = new Set(compactTitleTags(title))
  const evidenceTags = compactTitleTags(evidence)

  if (!evidenceTags.length || !titleTags.size) return false

  return evidenceTags.some((tag) => titleTags.has(tag))
}


function makeFactoryTitleFromEvidence(storySeed?: FactoryStorySeed | null) {
  const evidence = getSeedEvidenceObject(storySeed)
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

  params.parsed = {
    ...params.parsed,
    storyTitle: chosenStoryTitle.title,
  }

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
      },
      cover_art_style: normalizedCoverArtStyle,
      visual_style: normalizedCoverArtStyle,
      style: normalizedCoverArtStyle,
      styleLabel: getCoverArtStyleLabel(normalizedCoverArtStyle),
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